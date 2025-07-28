export interface CategoryColourSchema {
    category: string;
    colour: string;
}

export interface TimelineItemSchema {
    id: string;
    entity: string;
    category: string;
    description: string;
    start_day: number;
    start_time: number;
    duration: number;
}

export interface TimelineSchema {
    timelineId: string;
    timeline: TimelineItemSchema[];
}

export interface InputSchema {
    categoryColours: CategoryColourSchema[];
    timelines: TimelineSchema[];
}
