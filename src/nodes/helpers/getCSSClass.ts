export default function getCSSClass(clsProps: any) : string {

    const classes: Array<string> = [];

    for (var key in clsProps) {

        if (clsProps.hasOwnProperty(key)) {

            if (clsProps[key] === true) {

                classes.push(key);
            }
        }
    }

    return classes.join(' ');
}