import React, { useState, useMemo, useRef } from 'react';
import { Plus, Minus, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/Timeline';
import type {
    TimelineSchema,
    InputSchema
} from "@/types/types.tsx";

export function TimelineViewer() {
    const [jsonInput, setJsonInput] = useState<string>("");
    const [inputData, setInputData] = useState<InputSchema | null>();
    const [zoomLevel, setZoomLevel] = useState<number>(30); // minutes per grid unit
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Zoom levels: 5min, 15min, 30min, 1hr, 2hr, 4hr, 7.5hr
    const zoomLevels = [5, 15, 30, 60, 120, 240, 450];

    // interaction handlers
    const handleZoomIn = () => {
        const currentIndex = zoomLevels.indexOf(zoomLevel);
        if (currentIndex > 0) {
            setZoomLevel(zoomLevels[currentIndex - 1]);
        }
    };

    const handleZoomOut = () => {
        const currentIndex = zoomLevels.indexOf(zoomLevel);
        if (currentIndex < zoomLevels.length - 1) {
            setZoomLevel(zoomLevels[currentIndex + 1]);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonInput(content);
            };
            reader.readAsText(file);
        }
    };

    const handleLoad = () => {
        try {
            // parse json input
            setInputData(JSON.parse(jsonInput) as InputSchema);
        }
        catch (error) {
            console.log("Error parsing JSON")
            setInputData(null);
        }
    }
    
    return (
        <div className="p-6 max-w-full">
            <h1 className="text-2xl font-bold mb-4">Timeline Viewer</h1>
            
            {/* Controls */}
            <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleZoomIn}
                        disabled={zoomLevel === zoomLevels[0]}
                        size="sm"
                        variant="outline"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-16">
                        {zoomLevel < 60 ? `${zoomLevel}min` : `${zoomLevel / 60}h`}
                    </span>
                    <Button
                        onClick={handleZoomOut}
                        disabled={zoomLevel === zoomLevels[zoomLevels.length - 1]}
                        size="sm"
                        variant="outline"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                </div>
                    
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                >
                <Upload className="w-4 h-4 mr-2" />
                    Upload JSON
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* JSON Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">JSON Input:</label>
                <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-32 font-mono text-sm"
                    placeholder="Enter JSON data here..."
                />
            </div>
            
            {/* trigger timeline viewer */}
            <div>
                <Button
                    onClick={handleLoad}
                    size="sm"
                    variant="outline"
                >
                    Load
                </Button>
            </div>

            {/* Timeline Displays */}
            <div className="flex flex-row gap-24">
                {inputData ? inputData.timelines.map((timelineData: TimelineSchema, index: number) => {
                    return (
                        <Timeline key={index} timelineData={timelineData} zoomLevel={zoomLevel} categoryColours={inputData.categoryColours}></Timeline>
                    )
                }) : <p>Could not load data; make sure it is valid!</p>}
            </div>

        </div>
    )
}
