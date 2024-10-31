import { IRElementType, Entry } from "@/store/modules/IRElements/types"

export function findLinkedElementEntryTreePath(state: any, entryId: number, linkedElementType: IRElementType, linkedElementIndex: number, startingEntry: Entry | null = null, startingEntryPath: string = "") {
    let childEntries: Array<any> = []
    entryId = Number(entryId)
    if (startingEntry?.id == entryId) {
        return startingEntryPath
    }
    if (startingEntry == null) {
        childEntries = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries
    }
    else if (startingEntry.childEntries) {
        childEntries = startingEntry.childEntries
    }
    else {
        return null
    }
    for (const entry of childEntries) {
        const subResult: any = findLinkedElementEntryTreePath(state, entryId, linkedElementType, linkedElementIndex, entry, startingEntryPath + (startingEntry ? "|" + startingEntry.id.toString() : ""))
        if (subResult != null) {
            return subResult
        }
    }
    return null
}

export function findLinkedElementEntry(treePath:string, state:any, entryId:number, linkedElementType:IRElementType, linkedElementIndex:number){
    let entry:any = null
    if (treePath == "" || treePath == null){
        entry = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.find((entry:Entry) => entry.id==entryId)
        return entry
     }
     else{
        const treePathArr = treePath.split('|')
        let firstPass = true
        for (const parentId of treePathArr){
            if (parentId == ''){
                continue 
            }
            if (firstPass == true){
                entry = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.find((entry:Entry) => entry.id==Number(parentId))
                firstPass = false
            }
            else{
                if (entry && entry.childEntries)
                {
                    entry = entry.childEntries.find((entry:any) => entry.id ===Number(parentId))
                }
            }
            
        }
        if (entry?.childEntries)
        {
            entry = entry.childEntries.find((entry:any) => entry.id ===entryId)

        }

        return entry
    }

}


export function removeLinkedElementEntry(treePath:string, state:any, entryId:number, linkedElementType:IRElementType, linkedElementIndex:number){
    let entry:any = null
    if (treePath == "" || treePath == null){
        const entryIndexToChange = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.findIndex((entry:any) => entry.id===entryId)
        if (entryIndexToChange != -1) {
            // Splice child entries back into parent entry collection
            state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.splice(entryIndexToChange, 1,
                ...state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries[entryIndexToChange].childEntries)
        }
    }
     else{
        const treePathArr = treePath.split('|')
        let firstPass = true
        for (const parentId of treePathArr){
            if (parentId == ''){
                continue 
            }
            if (firstPass == true){
                entry = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.find((entry:any) => entry.id===Number(parentId))
                firstPass = false
            }
            else{
                if (entry && entry.childEntries)
                {
                    entry = entry.childEntries.find((entry:any) => entry.id ===Number(parentId))
                }
            }
            
        }
        if (entry?.childEntries)
        {
            const entryIndex = entry.childEntries.findIndex((entry:any) => entry.id ===entryId)
            if (entryIndex != -1) {
                entry.childEntries.splice(entryIndex, 1, ...entry.childEntries[entryIndex].childEntries)
            }

        }

    }

}



export function addLinkedElementEntry(treePath:string, state:any, entryId:number, entryPayload:any, linkedElementType:IRElementType, linkedElementIndex:number){
    let entry: any = null

    if (treePath == "" || treePath == null || treePath == undefined) {
        const entryToChange = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.find((entry: any) => entry.id === entryId)
        if (entryToChange) {
            Object.assign(entryToChange, entryPayload)
        }
        else{
            entryPayload['created'] = new Date().toISOString()
            entryPayload['childEntries'] = []
            state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.push(entryPayload)
        }
    }
     else{
        const treePathArr = treePath.split('|')
        let firstPass = true
        for (const parentId of treePathArr){
            if (parentId == ''){
                continue 
            }
            if (firstPass == true){
                entry = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex as number].entries.find((entry:any) => entry.id===Number(parentId))
                firstPass = false
            }
            else{
                if (entry && entry.childEntries)
                {
                    entry = entry.childEntries.find((entry:any) => entry.id ===Number(parentId))
                }
            }
            
        }
        if (entry?.childEntries)
        {
            const actualEntry = entry.childEntries.find((entry: any) => entry.id === entryId)
            if (actualEntry) {
                Object.assign(actualEntry, entryPayload)
            }
            else{
                entryPayload['childEntries'] = []
                entryPayload['created'] = new Date().toISOString()
                entry.childEntries.push(entryPayload)
            }

        }

    }

}


