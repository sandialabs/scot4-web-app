

import MarkdownPane from "@/components/Enrichments/MarkdownPane.vue"
import PlainTextPane from "@/components/Enrichments/PlainTextPane.vue"
import JsonPaneTree from "@/components/Enrichments/JsonPaneTree.vue"
import LineChartPane from "@/components/Enrichments/LineChartPane.vue"

export const EnrichmentTabComponents: Record<string, any> = {
    "markdown": MarkdownPane,
    "plaintext": PlainTextPane,
    "jsontree": JsonPaneTree,
    "linechart": LineChartPane,
}
