import { Entry } from "../store/modules/IRElements/types"

export function findEntryTreePath(state: any, entryId: number, startingEntry: Entry | null = null, startingEntryPath: string = "") {
    let childEntries: Array<any> = []
    entryId = Number(entryId)
    if (startingEntry?.id == entryId) {
        return startingEntryPath
    }
    if (startingEntry == null) {
        childEntries = state.SelectedElementEntries
    }
    else if (startingEntry.childEntries) {
        childEntries = startingEntry.childEntries
    }
    else {
        return null
    }
    for (const entry of childEntries) {
        const subResult: any = findEntryTreePath(state, entryId, entry, startingEntryPath + (startingEntry ? "|" + startingEntry.id.toString() : ""))
        if (subResult != null) {
            return subResult
        }
    }
    return null
}

export function findEntry(treePath:string, state:any, entryId:number ){
    let entry:any = null
    entryId = Number(entryId)
    if (treePath == "" || treePath == null){
        entry = state.SelectedElementEntries.find((entry:any) => entry.id===entryId)
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
                entry = state.SelectedElementEntries.find((entry:any) => entry.id===Number(parentId))
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


export function removeEntry(treePath:string, state:any, entryId:number){
    let entry: any = null
    if (treePath == '' || treePath == null){
        const entryIndexToChange = state.SelectedElementEntries.findIndex((entry:any) => entry.id===entryId)
        if (entryIndexToChange != -1){
            // Bubble up the child entries here. 
            state.SelectedElementEntries.splice(entryIndexToChange,1, ...state.SelectedElementEntries[entryIndexToChange].childEntries)
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
                entry = state.SelectedElementEntries.find((entry:any) => entry.id===Number(parentId))
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
            if (entryIndex != -1){
                entry.childEntries.splice(entryIndex,1, ...entry.childEntries[entryIndex].childEntries)
            }
        }
    }
}



export function addEntry(treePath:string, state:any, entryId:number, entryPayload:any){
    let entry:any = null
    let entryIndex:number|null = null

    if (treePath == "" || treePath == null){
        const entryIndexToChange = state.SelectedElementEntries.findIndex((entry:any) => entry.id===entryId)
        if (entryIndexToChange != -1) {
            Object.assign(state.SelectedElementEntries[entryIndexToChange], entryPayload)
        }
        else{
            entryPayload['created'] = new Date().toISOString()
            entryPayload['childEntries'] = []
            state.SelectedElementEntries.push(entryPayload)
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
                entry = state.SelectedElementEntries.find((entry:any) => entry.id===Number(parentId))
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
            entryIndex = entry.childEntries.findIndex((entry:any) => entry.id ===entryId)
            if (entryIndex != -1) {
                Object.assign(entry.childEntries[entryIndex as number], entryPayload)
            }
            else{
                entryPayload['childEntries'] = []
                entryPayload['created'] = new Date().toISOString()
                entry.childEntries.push(entryPayload)
            }

        }

    }

}

export function getParentEntryId(treePath:string,){
    if (treePath =='' || treePath == undefined || treePath == null)
    {
        return null
    }
    else{
        const treePathArr = treePath.split('|')
        return Number(treePathArr.slice(-1)[0])
    }
}


