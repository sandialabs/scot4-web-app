<template>
    <v-container fluid style="max-height: 100%" class="overflow-y-auto">
        <AdminNavBar />
    </v-container>

</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import AdminNavBar from '@/components/AdminComponents/AdminNavBar.vue'
    import { default_title } from '@/constants';

    @Component({
        components: {
            AdminNavBar
        },
    })

    export default class AdminView extends Vue {
        mounted() {
            document.title = default_title
        }
    }

</script>
