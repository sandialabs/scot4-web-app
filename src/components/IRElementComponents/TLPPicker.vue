<template>
    <v-menu>
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" x-small text>
                <svg style="width: 12px; height: 12px;">
                    <circle v-if="value == 'red'" r="5" cx="6" cy="6" style="fill: red; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="value == 'white' || value == 'clear'" r="5" cx="6" cy="6" style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                <svg style="width: 12px; height: 12px;">
                    <pattern id="diagonalRed" patternUnits="userSpaceOnUse" width="12" height="12">
                        <rect width="12" height="12" fill="orange" />
                        <path d="M1 1 L12 12" style="stroke: red; stroke-width:2;" />
                    </pattern>
                    <circle v-if="value == 'amber'" r="5" cx="6" cy="6" style="fill: orange; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="value == 'amber_strict'" r="5" cx="6" cy="6" fill="url(#diagonalRed)" style="stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="value == 'white' || value == 'clear'" r="5" cx="6" cy="6" style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                <svg style="width: 12px; height: 12px;">
                    <circle v-if="value == 'green'" r="5" cx="6" cy="6" style="fill: green; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="value == 'white' || value == 'clear'" r="5" cx="6" cy="6" style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                <v-icon small>mdi-chevron-down</v-icon>
                <span v-if="value == 'amber_strict'" class="red--text" style="position: absolute; left: 4px; top: 6px; font-size: 6px"><br/>STRICT</span>
            </v-btn>
        </template>
        <v-list dense>
            <v-subheader>Traffic Light Protocol (TLP) Color</v-subheader>
            <v-list-item v-for="item in TLPOptions" :key="item" @click="tlpItemClick(item)">{{item}}</v-list-item>
            <v-divider></v-divider>
            <v-list-item href="https://www.cisa.gov/tlp" target="_blank">What is TLP?</v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import { TLPCode } from '../../store/modules/IRElements/types'

    @Component({
        components: {
        },
    })
    export default class TLPComboBox extends Vue {
        @Prop() value: TLPCode

        TLPOptions: Array<string> = Object.keys(TLPCode).map((s) => s[0].toUpperCase() + s.substring(1))
            .map(val => val == 'Amber_strict' ? 'Amber+Strict' : val).filter(val => val != 'White')

        async tlpItemClick(item: string) {
            const newTlp = TLPCode[item.toLowerCase().replace('+', '_') as keyof typeof TLPCode]
            this.$emit('input', newTlp)
        }
    }
</script>