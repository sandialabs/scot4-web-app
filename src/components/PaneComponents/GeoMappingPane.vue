<template>
    <v-dialog v-model="isVisible" max-width="1000px">
        <v-card>
            <v-card-title>
                <span class="headline">Select IP Addresses</span>
                <v-tooltip right>
                        <template v-slot:activator=" { on }">
                            <v-btn icon v-on="on" @click="toggleSelectAll()">
                                <v-icon>
                                    mdi-checkbox-multiple-marked-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>
                            Select all IPs for mapping
                        </span>
                    </v-tooltip>
                <v-spacer></v-spacer>
                <v-btn icon @click="toggleCheckboxList">
                    <v-icon>{{ showCheckboxList ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div v-if="loading" class="d-flex flex-column align-center justify-center" style="text-align: center;">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p>Loading enrichment data for IPs...</p>
                </div>
                <v-expand-transition>
                    <div v-if="showCheckboxList">
                        <v-list v-if="!loading" style="max-height: 300px; overflow-y: auto;">
                        <v-list-item-group>
                            <v-list-item v-for="ipData in validIpAddresses" :key="ipData.id" >
                                <v-checkbox 
                                    :label="`${ipData.label} (${ipData.city}, ${ipData.country})`" 
                                    :value="ipData.id" 
                                    v-model="selectedEntities"
                                    class="mr-2"
                                />
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                    </div>
                </v-expand-transition>
                <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
                <div id="map" class="mt-4" style="height: 400px; width: 100%;"></div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" :disabled="isSubmitting" @click="submitEntry">
                    <v-progress-circular v-if="isSubmitting" indeterminate color="white" size="20" class="mr-2"></v-progress-circular>
                    Add Map As Entry
                </v-btn>
                <v-btn @click="closeModal">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { toPng } from 'html-to-image';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IRElement, IRElementType } from '../../store/modules/IRElements/types'

@Component
export default class GeoMappingPane extends Vue {
    @Prop() target: IRElement | null
    @Prop({ default: false }) readonly value!: boolean; // v-model binding
    @Prop({ required: true }) readonly displayedEntities!: Record<string, any>;
    @Prop({ default: false }) readonly selectedEntityIds!: number[]; // Pass selected IP addresses
    
    validIpAddresses: any[] = []; // To store valid IP addresses with geo information
    selectedEntities: number[] = []; 
    loading: boolean = false; 
    errorMessage: string | null = null; 
    showCheckboxList: boolean = true;
    mapImage: string | null = null; // To store the generated map image
    map: L.Map | null = null;
    allSelected: boolean = false;
    isSubmitting: boolean = false;

    get isVisible(): boolean {
        return this.value;
    }

    toggleCheckboxList() {
        this.showCheckboxList = !this.showCheckboxList;
    }

    toggleSelectAll() {
        if (this.allSelected) {
            this.selectedEntities = []; // Deselect all
        } else {
            this.selectedEntities = this.validIpAddresses.map(ip => ip.id); // Select all
        }
        this.allSelected = !this.allSelected; // Toggle the state
    }

    // Filter entities to only include those of type 'ipaddr'
    get filteredEntities() {
        return Object.keys(this.displayedEntities)
            .filter(entityType => entityType === 'ipaddr')
            .reduce((acc, entityType) => {
                acc[entityType] = this.displayedEntities[entityType];
                return acc;
            }, {} as Record<string, any>);
    }

    closeModal() {
        this.$emit('input', false); // Emit input event to close the modal
    }

    @Watch('isVisible')
    async openGeoModal(newValue: boolean) {
        if (newValue) {
            // Modal is opening
            this.$nextTick(() => {
                this.generateMap();
            });
            await this.fetchEnrichmentData();
        }
    }

    async fetchEnrichmentData() {
        this.loading = true; // Set loading state to true
        this.errorMessage = null; // Reset error message
        this.validIpAddresses = [];
        const ipAddresses = this.displayedEntities['ipaddr'] || [];

        // Create an array to hold promises
        const promises = [];

        // Iterate over each IP address in selectedEntityIds
        for (const key in ipAddresses) {
            const ip = ipAddresses[key];

            // Create a promise for each API call
            const promise = Vue.prototype.$api.elements.retrieveEntityEnrichmentsbyID(ip.id)
                .then((response: any) => {
                    const enrichmentData = response.data;
                    const geoIpSummary = enrichmentData['Geo IP Summary'];
                    // Check if the enrichment data contains geo information
                    if (geoIpSummary && geoIpSummary.length > 0) {
                        const markdownData = geoIpSummary[0].data.markdown;
                        const geoInfo = this.parseMarkdown(markdownData);
                        if (geoInfo.lat && geoInfo.long) {
                            this.validIpAddresses.push({
                                id: ip.id,
                                city: geoInfo.city,
                                country: geoInfo.country,
                                latitude: geoInfo.lat,
                                longitude: geoInfo.long,
                                isp: geoInfo.isp,
                                value: ip.id,
                                label: ip.value
                            });
                        }
                    }
                })
                .catch((error: any) => {
                    console.error('Error fetching enrichment data for IP:', ip.id, error);
                });

            promises.push(promise); // Add the promise to the array
        }

        // Wait for all promises to resolve
        await Promise.all(promises);

        this.loading = false; // Set loading state to false after fetching

        if (this.validIpAddresses.length === 0) {
            this.errorMessage = 'No IP addresses with geographical information found.';
        }
    }

    @Watch('selectedEntities')
    generateMap() {
        // Process selectedEntities to generate the map
        const selectedIps = this.selectedEntities; // Get selected IP IDs
        
        const locations = this.validIpAddresses.filter(ip => selectedIps.includes(ip.id)); // Filter valid IPs

        if (!this.map) {
            this.$nextTick(() => {
                this.map = L.map('map').setView([0, 0], 2); // Center on the world with zoom level 2
                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(this.map);
                this.map.invalidateSize();
            });
        }

        if (this.map) {
            // Clear existing markers
            this.map.eachLayer((layer: any) => {
                if (layer instanceof L.Marker && this.map) {
                    this.map.removeLayer(layer);
                }
            });

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(this.map);

            const markerPositions: [number, number][] = [];

            // Add markers for each selected IP
            locations.forEach(ip => {
                if (this.map) {
                    const marker = L.marker([ip.latitude, ip.longitude]).addTo(this.map).bindPopup(`${ip.label}<br>${ip.city}, ${ip.country}`);
                    markerPositions.push([ip.latitude, ip.longitude]);   
                }
            });

            if (markerPositions.length > 0) {
                this.map.fitBounds(markerPositions); // Automatically adjust the view to show all markers
            }

            this.map.invalidateSize();
        }
    }

    parseMarkdown(markdown: string) {
        const lines = markdown.split('\n');
        const geoInfo: Record<string, any> = {};
        lines.forEach(line => {
            const parts = line.split('|').map(part => part.trim());
            if (parts.length === 4) {
                const key = parts[1];
                const value = parts[2];
                geoInfo[key] = value; // Store key-value pairs in geoInfo
            }
        });

        return geoInfo; // Return the parsed geographical information
    }

    async submitEntry() {
        const mapContainer = document.getElementById('map'); // Get the map container
        if (mapContainer && this.target && this.target.id && this.target.ElementType) {
            this.isSubmitting = true;
                try {
                    const dataUrl = await toPng(mapContainer);
                    
                    // Prepare the data structure for the entry
                    const entryCreateOrUpdateAttributes = {
                        target_id: this.target.id,
                        target_type: this.target.ElementType,
                        entry_data: {
                            html: `<img src="${dataUrl}" alt="Map Image" />` // Wrap the Base64 data in an <img> tag
                        }
                    };
                    // Call the existing method to update or create an entry
                    const response = await Vue.prototype.$api.elements.updateOrCreateEntry(-1, entryCreateOrUpdateAttributes);
            } catch (error) {
                this.errorMessage = 'Error capturing the map or sending data to API.';
            } finally {
                this.isSubmitting = false;
                this.closeModal();
            }
        } else {
            this.errorMessage = 'Error building mapping form.';
        }
    }
}
</script>
