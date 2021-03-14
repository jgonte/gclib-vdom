export default function isStandardEvent(name: string): boolean {

    return [
        // Keyboard
        'onkeydown',
        'onkeypress',
        'onkeyup',

        // Mouse
        'onclick',
        'ondblclick',
        'onmousedown',
        'onmousemove',
        'onmouseout',
        'onmouseover',
        'onmouseup',
        'onwheel',

        // Form
        'onchange',
        'oninput',
        'onfocus',
        'onblur',

        // More as needed
    ].indexOf(name) > -1;
}
