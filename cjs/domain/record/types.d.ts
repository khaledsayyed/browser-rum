import { DefaultPrivacyLevel } from '@datadog/browser-core';
import { FocusRecord, RawRecord, VisualViewportRecord } from '../../types';
import { MutationController } from './mutationObserver';
export declare enum IncrementalSource {
    Mutation = 0,
    MouseMove = 1,
    MouseInteraction = 2,
    Scroll = 3,
    ViewportResize = 4,
    Input = 5,
    TouchMove = 6,
    MediaInteraction = 7,
    StyleSheetRule = 8
}
export declare type MutationData = {
    source: IncrementalSource.Mutation;
} & MutationPayload;
export interface MousemoveData {
    source: IncrementalSource.MouseMove | IncrementalSource.TouchMove;
    positions: MousePosition[];
}
export declare type MouseInteractionData = {
    source: IncrementalSource.MouseInteraction;
} & MouseInteractionParam;
export declare type ScrollData = {
    source: IncrementalSource.Scroll;
} & ScrollPosition;
export declare type ViewportResizeData = {
    source: IncrementalSource.ViewportResize;
} & ViewportResizeDimention;
export declare type InputData = {
    source: IncrementalSource.Input;
    id: number;
} & InputState;
export declare type MediaInteractionData = {
    source: IncrementalSource.MediaInteraction;
} & MediaInteractionParam;
export declare type StyleSheetRuleData = {
    source: IncrementalSource.StyleSheetRule;
} & StyleSheetRuleParam;
export declare type IncrementalData = MutationData | MousemoveData | MouseInteractionData | ScrollData | ViewportResizeData | InputData | MediaInteractionData | StyleSheetRuleData;
export interface RecordOptions {
    emit?: (record: RawRecord) => void;
    defaultPrivacyLevel: DefaultPrivacyLevel;
}
export interface RecordAPI {
    stop: ListenerHandler;
    takeFullSnapshot: () => void;
    flushMutations: () => void;
}
export interface ObserverParam {
    defaultPrivacyLevel: DefaultPrivacyLevel;
    mutationController: MutationController;
    mutationCb: MutationCallBack;
    mousemoveCb: MousemoveCallBack;
    mouseInteractionCb: MouseInteractionCallBack;
    scrollCb: ScrollCallback;
    viewportResizeCb: ViewportResizeCallback;
    visualViewportResizeCb: VisualViewportResizeCallback;
    inputCb: InputCallback;
    mediaInteractionCb: MediaInteractionCallback;
    styleSheetRuleCb: StyleSheetRuleCallback;
    focusCb: FocusCallback;
}
export interface RumCharacterDataMutationRecord {
    type: 'characterData';
    target: Node;
    oldValue: string | null;
}
export interface RumAttributesMutationRecord {
    type: 'attributes';
    target: Element;
    oldValue: string | null;
    attributeName: string | null;
}
export interface RumChildListMutationRecord {
    type: 'childList';
    target: Node;
    addedNodes: NodeList;
    removedNodes: NodeList;
}
export declare type RumMutationRecord = RumCharacterDataMutationRecord | RumAttributesMutationRecord | RumChildListMutationRecord;
export interface TextCursor {
    node: Node;
    value: string | null;
}
export interface TextMutation {
    id: number;
    value: string | null;
}
export interface AttributeCursor {
    node: Node;
    attributes: {
        [key: string]: string | null;
    };
}
export interface AttributeMutation {
    id: number;
    attributes: {
        [key: string]: string | null;
    };
}
export interface RemovedNodeMutation {
    parentId: number;
    id: number;
}
export interface AddedNodeMutation {
    parentId: number;
    previousId?: number | null;
    nextId: number | null;
    node: SerializedNodeWithId;
}
export interface MutationPayload {
    texts: TextMutation[];
    attributes: AttributeMutation[];
    removes: RemovedNodeMutation[];
    adds: AddedNodeMutation[];
}
export declare type MutationCallBack = (m: MutationPayload) => void;
export declare type MousemoveCallBack = (p: MousePosition[], source: IncrementalSource.MouseMove | IncrementalSource.TouchMove) => void;
export interface MousePosition {
    x: number;
    y: number;
    id: number;
    timeOffset: number;
}
export declare const MouseInteractions: {
    readonly MouseUp: 0;
    readonly MouseDown: 1;
    readonly Click: 2;
    readonly ContextMenu: 3;
    readonly DblClick: 4;
    readonly Focus: 5;
    readonly Blur: 6;
    readonly TouchStart: 7;
    readonly TouchEnd: 9;
};
export declare type MouseInteractions = typeof MouseInteractions[keyof typeof MouseInteractions];
export interface MouseInteractionParam {
    type: MouseInteractions;
    id: number;
    x: number;
    y: number;
}
export declare type MouseInteractionCallBack = (d: MouseInteractionParam) => void;
export interface ScrollPosition {
    id: number;
    x: number;
    y: number;
}
export declare type ScrollCallback = (p: ScrollPosition) => void;
export interface StyleSheetAddRule {
    rule: string;
    index?: number;
}
export interface StyleSheetDeleteRule {
    index: number;
}
export interface StyleSheetRuleParam {
    id: number;
    removes?: StyleSheetDeleteRule[];
    adds?: StyleSheetAddRule[];
}
export declare type StyleSheetRuleCallback = (s: StyleSheetRuleParam) => void;
export interface ViewportResizeDimention {
    width: number;
    height: number;
}
export declare type ViewportResizeCallback = (d: ViewportResizeDimention) => void;
export declare type InputState = {
    text: string;
} | {
    isChecked: boolean;
};
export declare type InputCallback = (v: InputState & {
    id: number;
}) => void;
export declare const MediaInteractions: {
    readonly Play: 0;
    readonly Pause: 1;
};
export declare type MediaInteractions = typeof MediaInteractions[keyof typeof MediaInteractions];
export interface MediaInteractionParam {
    type: MediaInteractions;
    id: number;
}
export declare type MediaInteractionCallback = (p: MediaInteractionParam) => void;
export declare type FocusCallback = (data: FocusRecord['data']) => void;
export declare type VisualViewportResizeCallback = (data: VisualViewportRecord['data']) => void;
export declare type ListenerHandler = () => void;
export declare type HookResetter = () => void;
export declare enum NodeType {
    Document = 0,
    DocumentType = 1,
    Element = 2,
    Text = 3,
    CDATA = 4,
    Comment = 5
}
export declare type DocumentNode = {
    type: NodeType.Document;
    childNodes: SerializedNodeWithId[];
};
export declare type DocumentTypeNode = {
    type: NodeType.DocumentType;
    name: string;
    publicId: string;
    systemId: string;
};
export declare type Attributes = {
    [key: string]: string | number | boolean;
};
export declare type ElementNode = {
    type: NodeType.Element;
    tagName: string;
    attributes: Attributes;
    childNodes: SerializedNodeWithId[];
    isSVG?: true;
};
export declare type TextNode = {
    type: NodeType.Text;
    textContent: string;
    isStyle?: true;
};
export declare type CDataNode = {
    type: NodeType.CDATA;
    textContent: '';
};
export declare type SerializedNode = DocumentNode | DocumentTypeNode | ElementNode | TextNode | CDataNode;
export declare type SerializedNodeWithId = SerializedNode & {
    id: number;
};
