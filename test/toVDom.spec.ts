import { VirtualText } from '../src/gclib-vdom';
import parseFromString from '../src/nodes/parser/parseFromString';
import toVDom from '../src/nodes/parser/toVDom';
import VirtualNode from '../src/nodes/VirtualNode';

describe("parse a string and covert to a virtual dom tree tests", () => {

    it('should create a virtual node tree from html markup', () => {

        const markup = 
    `<gcl-list-item value=1>       
        <span><gcl-text>Name: Sarah</gcl-text>Some text</span>
        <script></script>
        <gcl-text>Date of Birth: 6/26/2003</gcl-text>
        <gcl-text>Reputation: 10</gcl-text>
        <gcl-text>Description: Very beautiful and smart</gcl-text>
        <img style="width: 64px; height: 64px; border-radius: 50%;" src=data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAZABMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2rVNTg0ixa6uBIw3KiRxLueR2OFRR6kkD09SBzWfbeJTLrFvpl3o2pWFxco7xG4ETIwUZPzRyMAenHWpPEjaO1hBbazcm3iublI4JBI0bLN95Crj7pyuQemeO+KpJLqWkeJdN06TVpdThvllLpdRRLLCEXO9TEqDaSVUgg8suCOhypwi4arXXv0XT9bmknY6aiiiucZXvLCz1CERXtpBcxg5CTRhwDgjofYkfQmoNO0PSNHaRtM0uysjIAJDbW6R78dM7QM9TV+iqU5Jct9ACiiipA//Z />
    </gcl-list-item>`;

        const node = parseFromString(markup, 'html');

        expect(node).not.toBeNull();

        const vnode  = toVDom(node!, { excludeTextWithWhiteSpacesOnly: true}) as VirtualNode;

        expect(vnode.name).toEqual('gcl-list-item');

        expect(vnode.props).toMatchObject({
            value: '1'
        });

        expect(vnode.children.length).toEqual(5);

        const spanVNode = vnode.children[0] as VirtualNode;

        expect(spanVNode.name).toEqual('span');

        const gclTextVNode = spanVNode.children[0] as VirtualNode;

        expect(gclTextVNode.name).toEqual('gcl-text');

        const textVNode = gclTextVNode.children[0] as VirtualText;

        expect(textVNode.text).toEqual('Name: Sarah');

        const imgVNode = vnode.children[4] as VirtualNode;

        expect(imgVNode.name).toEqual('img');

        expect(imgVNode.props).toMatchObject({
            src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAZABMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2rVNTg0ixa6uBIw3KiRxLueR2OFRR6kkD09SBzWfbeJTLrFvpl3o2pWFxco7xG4ETIwUZPzRyMAenHWpPEjaO1hBbazcm3iublI4JBI0bLN95Crj7pyuQemeO+KpJLqWkeJdN06TVpdThvllLpdRRLLCEXO9TEqDaSVUgg8suCOhypwi4arXXv0XT9bmknY6aiiiucZXvLCz1CERXtpBcxg5CTRhwDgjofYkfQmoNO0PSNHaRtM0uysjIAJDbW6R78dM7QM9TV+iqU5Jct9ACiiipA//Z",
            style: "width: 64px; height: 64px; border-radius: 50%;",
        });
    });

    // DOMParser for xml is not implemented in HappyDom yet
    // it('should create a node tree from xml markup', () => {

    //     const markup = 
    // `<gcl-list-item value=1>       
    //     <gcl-text>Name: Sarah</gcl-text>
    //     <gcl-text>Date of Birth: 6/26/2003</gcl-text>
    //     <gcl-text>Reputation: 10</gcl-text>
    //     <gcl-text>Description: Very beautiful and smart</gcl-text>
    //     <img style="width: 64px; height: 64px; border-radius: 50%;" src=data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAZABMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2rVNTg0ixa6uBIw3KiRxLueR2OFRR6kkD09SBzWfbeJTLrFvpl3o2pWFxco7xG4ETIwUZPzRyMAenHWpPEjaO1hBbazcm3iublI4JBI0bLN95Crj7pyuQemeO+KpJLqWkeJdN06TVpdThvllLpdRRLLCEXO9TEqDaSVUgg8suCOhypwi4arXXv0XT9bmknY6aiiiucZXvLCz1CERXtpBcxg5CTRhwDgjofYkfQmoNO0PSNHaRtM0uysjIAJDbW6R78dM7QM9TV+iqU5Jct9ACiiipA//Z />
    // </gcl-list-item>`;

    //     const node = parseFromString(markup, 'xml');

    //     expect(node).not.toBeNull();
    // });
});


