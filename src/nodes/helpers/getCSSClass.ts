export default function getCSSClass(clsProps: any) : string {

    return Object.keys(clsProps).filter(k => clsProps[k] === true).join(' ');
}