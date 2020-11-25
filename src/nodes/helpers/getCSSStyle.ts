export default function getCSSStyle(styleProps: any) : string {

    return Object.keys(styleProps).reduce((acc, key) => (
        acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + styleProps[key] + ';'
    ), '');
}