<template>
 <IRCalendarComponent/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import IRCalendarComponent from '@/components/CalendarComponents/IRCalendarComponent.vue'
import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
import { default_title } from '@/constants';

const namespace: string = 'team';

@Component({
  components: {
   IRCalendarComponent,
   ScotNavBar,
   QuickSettingsDrawer
    },
})

export default class CalendarView extends Vue{
    mounted() {
        document.title = default_title
    }
}

</script>
