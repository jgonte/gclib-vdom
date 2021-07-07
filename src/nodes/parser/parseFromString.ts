export default function parseFromString(markup: string, type: 'html' | 'xml' = 'xml') : NodeListOf<ChildNode> {

    const mime = type === 'html' ? 'text/html' : 'application/xml';

    const wrappedMarkup = type === 'html' ?
        `<!DOCTYPE html>\n<html><body>${markup}</body></html>` :
        `<?xml version="1.0" encoding="UTF-8"?>\n<xml>${markup}</xml>`;

    const doc = new DOMParser().parseFromString(wrappedMarkup, mime);

    const tag = type === 'html' ? 'body' : 'xml';

    // Extract the inner node
    return doc.getElementsByTagName(tag)[0].childNodes;
}