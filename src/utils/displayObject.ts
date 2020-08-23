function indent(depth: number): string {

    return ' '.repeat(depth * 4);
}

function displayAttributes(o: object, depth: number): string {

    const attrs: string[] = [];

    for (const [k, v] of Object.entries(o)) {

        if (typeof v === 'undefined') {

            attrs.push(`${indent(depth)}${k}: undefined`);
        }
        else if (v === null) {

            attrs.push(`${indent(depth)}${k}: null`);
        }
        else if (typeof v === 'string') {

            attrs.push(`${indent(depth)}${k}: '${v}'`);
        }
        else if (typeof v === 'function') {

            attrs.push(`${indent(depth)}${k}: '${v.toString()}'`); //TODO: review
        }
        else if (typeof v === 'symbol') {

            attrs.push(`${indent(depth)}${k}: '${v.toString()}'`); //TODO: review
        }
        else if (typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'bigint' ||
            typeof v === 'boolean') {

            attrs.push(`${indent(depth)}${k}: ${v}`);
        }
        else if (Array.isArray(v)) {

            attrs.push(`${indent(depth)}${k}:${displayArray(v, depth)}`);
        }
        else { // object

            attrs.push(`${indent(depth)}${k}:${displayObject(v, depth)}`);
        }

    }

    return attrs.join(',\n');
}

function displayArray(array: any[], depth: number): string {

    const items: string[] = [];

    array.forEach(v => {

        if (typeof v === 'undefined') {

            items.push(`${indent(depth + 1)}undefined`);
        }
        else if (v === null) {

            items.push(`${indent(depth + 1)}null`);
        }
        else if (typeof v === 'string') {

            items.push(`${indent(depth + 1)}'${v}'`);
        }
        else if (typeof v === 'function') {

            items.push(`${indent(depth + 1)}'${v.toString()}'`); //TODO: review
        }
        else if (typeof v === 'symbol') {

            items.push(`${indent(depth + 1)}'${v.toString()}'`); //TODO: review
        }
        else if (typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'bigint' ||
            typeof v === 'boolean') {

            items.push(`${indent(depth + 1)}${v}`);
        }
        else if (Array.isArray(v)) {

            items.push(`${displayArray(v, depth + 1)}`);
        }
        else { // object

            items.push(displayObject(v, depth + 1));
        }

    });

    if (items.length) {

        const arrayString = items.join(
`,
`
        );

        return `
${indent(depth)}[
${arrayString}
${indent(depth)}]`;

    }
    else {

        return `
${indent(depth)}[]`;
    }

}

/**
 * Returns a string representation of an object
 * @param o The object to display
 */
export default function displayObject(o?: any | null, depth: number = 0): string {

    if (typeof o === 'undefined') {

        return 'undefined';
    }
    else if (o === null) {

        return 'null';
    }
    else if (typeof o === 'string') {

        return `'${o}'`;
    }
    else if (typeof o === 'function') {

        return `'${o.toString()}'`; //TODO: review
    }
    else if (typeof o === 'symbol') {

        return `'${o.toString()}'`; //TODO: review
    }
    else if (typeof o === 'string' ||
        typeof o === 'number' ||
        typeof o === 'bigint' ||
        typeof o === 'boolean') {

        return `${o}`;
    }
    else if (Array.isArray(o)) {

        return displayArray(o, depth);
    }

    const attributes: string = displayAttributes(o, depth + 1);

    const name: string = o.constructor.name === 'Object' ? '' : o.constructor.name;

    if (attributes) {

        if (name) {

            return `
${indent(depth)}(${name}) {
${attributes}
${indent(depth)}}`;

        }
        else {

            return `
${indent(depth)}{
${attributes}
${indent(depth)}}`;

        }

    }
    else {

        if (name) {

            return `
${indent(depth)}(${name}) {}`;
        }
        else {

            return `
${indent(depth)}{}`;
        }

    }

}