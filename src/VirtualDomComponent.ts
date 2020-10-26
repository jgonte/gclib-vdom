import { LifecycleHooks, UpdatedChildren } from "./patches/Patch";
import VirtualNode from './nodes/VirtualNode';
import VirtualText from './nodes/VirtualText';
import mount from './nodes/helpers/mount';
import callMixins from "./customElement/helpers/callMixins";

/**
 * Component that uses the virtual DOM to update its view
 */
export default abstract class VirtualDomComponent implements LifecycleHooks {

    /** 
      * Previous node to diff with the current one 
      */
    private previousNode?: VirtualNode | VirtualText; 

    /** 
     * The DOM document in which this component is updated 
     */
    abstract get document(): ShadowRoot | Document | Node;

    /**
     * The root element
     */
    abstract get rootElement(): Node | null;

    /**
     * Renders the view of this component
     */
    abstract render(): VirtualNode | VirtualText;

    // Lifecycle methods
    onNodeWillConnect?: (node: Node) => void;

    onNodeDidConnect?: (node: Node) => void;

    onNodeWillDisconnect?: (node: Node) => void;

    onNodeDidUpdate?: (node: Node, updatedChildren: UpdatedChildren) => void;

    bindLifecycleCallbacks() {

        this.nodeWillConnect = this.nodeWillDisconnect.bind(this);

        this.nodeDidConnect = this.nodeDidConnect.bind(this);

        this.nodeWillDisconnect = this.nodeWillDisconnect.bind(this);

        this.nodeDidUpdate = this.nodeDidUpdate.bind(this);
    }

    update(): void {

        let currentNode: VirtualNode | VirtualText = (this as any).render();

        mount((this as any).document, currentNode, this.previousNode, (this as any).rootElement, this);

        this.previousNode = currentNode;
    }

    nodeWillConnect(node: Node) {

        //callMixins(this, 'nodeWillConnect', node);

        if (this.onNodeWillConnect) {

            this.onNodeWillConnect(node);
        }
    }

    nodeDidConnect(node: Node) {

        //callMixins(this, 'nodeDidConnect', node);

        if (this.onNodeDidConnect) {

            this.onNodeDidConnect(node);
        }
    }

    nodeWillDisconnect(node: Node) {

        //callMixins(this, 'nodeWillDisconnect', node);

        if (this.onNodeWillDisconnect) {

            this.onNodeWillDisconnect(node);
        }
    }
    
    nodeDidUpdate(node: Node, updatedChildren: UpdatedChildren) {

        //callMixins(this, 'nodeDidUpdateChildren', node);

        if (this.onNodeDidUpdate) {

            this.onNodeDidUpdate(node, updatedChildren);
        }
    }
    
}


