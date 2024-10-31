// Utility to convert targettype names to snake case for the api
export function convertToSnakeCase(name: string) {
    if (!name) {
        return undefined;
    }
    return name.replace(/[A-Z]/g, (letter, index) => { return index == 0 ? letter.toLowerCase() : '_' + letter.toLowerCase(); });
}

// Utility to convert targettype names from the api to camel case
export function convertFromSnakeCase(name: string) {
    if (!name) {
        return undefined;
    }
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_[a-z]/, (match) => { return match.charAt(1).toUpperCase() });
}