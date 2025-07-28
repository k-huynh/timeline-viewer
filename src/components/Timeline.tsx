import { useMemo } from "react";
import type { CategoryColourSchema, TimelineItemSchema, TimelineSchema } from "@/types/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const GridUnitHeightPx = 80;

export function Timeline({timelineData, zoomLevel, categoryColours}: {timelineData : TimelineSchema, zoomLevel : number, categoryColours: CategoryColourSchema[]}) {
    const processedData = useMemo(() => {
        if (!timelineData || timelineData.timeline.length === 0) return { entities: [], entityTimelines: {}, maxDay: 0, dayBounds: {} };

        // group events by entity
        const entities = [...new Set(timelineData.timeline.map(e => e.entity))]
        const entityTimelines: {[index: string]: {[index: number]: TimelineItemSchema[]}} = {};
        const dayBounds: {[index: string]:any} = {};

        entities.forEach(entity => {
            entityTimelines[entity] = {};
        })

        // sort events by start time within each day
        const sortedEvents = [...timelineData.timeline].sort((a, b) => {
            if (a.start_day !== b.start_day) return a.start_day - b.start_day;
            return a.start_time - b.start_time;
        })

        // process events
        sortedEvents.forEach(event => {
            const { entity, category, description, start_day, start_time, duration } = event;

            if (!entityTimelines[entity][start_day]) {
                entityTimelines[entity][start_day] = [];
            }

            const dayEvents = entityTimelines[entity][start_day];
            const eventEnd = start_time + duration;

            dayEvents.push(event);

            if (!dayBounds[start_day] || eventEnd > dayBounds[start_day]) { 
                dayBounds[start_day] = eventEnd;
            }
        })

        const maxDay = Math.max(...Object.keys(dayBounds).map(Number))

        return {
            entities: entities,
            entityTimelines: entityTimelines,
            maxDay: maxDay,
            dayBounds: dayBounds
        }

    }, [timelineData])

    const { entities, entityTimelines, maxDay, dayBounds } = processedData;
    
    // grid related stuff    
    // Calculate cumulative day offsets
    const dayOffsets = useMemo(() => {
        const offsets: {[index: number]: number} = { 0: 0 };
        let cumulativeOffset = 0;
        
        for (let day = 0; day <= maxDay; day++) {
            if (day > 0) {
                const prevDayEnd = dayBounds[day - 1] || 0;
                cumulativeOffset += Math.ceil(prevDayEnd / zoomLevel) * zoomLevel;
                offsets[day] = cumulativeOffset;
            }
        }
        
        return offsets;
    }, [dayBounds, maxDay, zoomLevel]);
    
    // Calculate total height
    const totalHeight = useMemo(() => {
        const lastDayOffset = dayOffsets[maxDay] || 0;
        const lastDayEnd = dayBounds[maxDay] || 0;
        const totalMinutes = lastDayOffset + lastDayEnd;
        return totalMinutes; // in minutes
    }, [dayOffsets, dayBounds, maxDay, zoomLevel]);
    
    const pixelsPerMinute = GridUnitHeightPx / zoomLevel;
    const totalHeightPx = totalHeight * pixelsPerMinute;
    const gridUnitPx = zoomLevel * pixelsPerMinute;
    
    // Generate grid lines
    const gridLines: number[] = [];
    for (let time = 0; time <= totalHeight; time += zoomLevel) {
        gridLines.push(time);
    }
    
    const getEventPosition = (event: {start_day: number, start_time: number, duration: number}) => {
        const dayOffset = dayOffsets[event.start_day] || 0;
        const absoluteTime = dayOffset + event.start_time;
        return {
            top: absoluteTime * pixelsPerMinute,
            height: event.duration * pixelsPerMinute
        };
    };

    const getDayBackgroundColor = (day: number) => {
        return day % 2 === 0 ? 'bg-gray-100' : 'bg-white';
    };
    
    if (entities.length === 0) {
        return (
        <div className="p-4 text-center text-gray-500">
            No events to display
        </div>
        );
    }

    const getEventColour = (event: TimelineItemSchema) => {
        const categoryColour = categoryColours.find((el) => el.category === event.category)

        if (categoryColour) {
            return categoryColour.colour
        }
        
        return 'oklch(26.8% 0.007 34.298)'
    }

    return (
        <div className="flex flex-col gap-8">
            <p className="pl-9 font-bold">
                {timelineData.timelineId}
            </p>
            <div className="flex">
                {/* entities */}
                {entities.map((entity, entityIndex) => (
                    <div key={entity} className="flex flex-col">
                        {entityIndex === 0 ? 
                            <div className="ml-9 w-15 mx-2 mb-6">
                                    <p className="text-sm truncate">{entity}</p>
                            </div>
                            : 
                            <div className="mx-2 w-6 mb-6">
                                <p className="text-sm truncate">{entity}</p>
                            </div>
                        }
                        <div>
                            <div className="relative">
                                <div className="flex" style={{ height: totalHeightPx }}>                                    
                                    {/* Left-side timestamp gutter for first entity only */}
                                    {entityIndex === 0 && (
                                        <div className="relative w-9">
                                            {gridLines.map((time, index) => {
                                                let currentDay = 0;
                                                for (let d = 0; d <= maxDay; d++) {
                                                    const start = dayOffsets[d] || 0;
                                                    const end = dayOffsets[d + 1] || totalHeight;
                                                    if (time >= start && time < end) {
                                                        currentDay = d;
                                                        break;
                                                    }
                                                }
                                                const dayStart = dayOffsets[currentDay] || 0;
                                                const timeInDay = time - dayStart;
                                                const hours = Math.floor(timeInDay / 60);
                                                const minutes = timeInDay % 60;
                                                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                                return (
                                                    <div key={index}>
                                                        <div
                                                            className="absolute text-xs text-gray-500/60 px-1"
                                                            style={{
                                                                top: time * pixelsPerMinute,
                                                                transform: 'translateY(-50%)'
                                                            }}
                                                        >
                                                            {formattedTime}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Main timeline container */}
                                    <div className="relative flex-1">
                                        {/* Day backgrounds */}
                                        {Array.from({ length: maxDay + 1 }, (_, day) => {
                                            const dayStart = dayOffsets[day] || 0;
                                            const dayEnd = day < maxDay ? (dayOffsets[day + 1] || 0) : totalHeight;
                                            const dayHeight = (dayEnd - dayStart) * pixelsPerMinute;
                                            return (
                                                <div key={`day-bg-${day}`}
                                                    className={`absolute w-full ${getDayBackgroundColor(day)}`}
                                                    style={{
                                                        top: dayStart * pixelsPerMinute,
                                                        height: dayHeight
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* Grid lines */}
                                        {gridLines.map((time, index) => (
                                            <div key={index}>
                                                <div
                                                    className="absolute w-full border-t border-gray-200"
                                                    style={{ top: time * pixelsPerMinute }}
                                                />
                                            </div>
                                        ))}

                                        {/* Events */}
                                        {Object.entries(entityTimelines[entity] || {}).map(([day, dayEvents]) =>
                                            dayEvents.map(event => {
                                                const position = getEventPosition(event);
                                                return (
                                                    <HoverCard key={event.id} >
                                                        <HoverCardTrigger asChild>
                                                            <div
                                                                className="absolute w-6 rounded cursor-pointer transition-color"
                                                                style={{
                                                                    top: position.top,
                                                                    height: position.height,
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)',
                                                                    backgroundColor: getEventColour(event)
                                                                }}
                                                            />
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="" side="right">
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-stone-600">{event.category}</p>
                                                                <p className="text-sm">{event.description}</p>
                                                                <p className="text-xs text-stone-600">{event.duration} min</p>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}