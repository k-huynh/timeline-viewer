# Timeline Viewer
Quick and dirty timeline viewer for events given start day, time, and duration.

Reads in a JSON with the following schema:
```
{
	"categoryColours": [
        {"category": "cat1", "colour": "bg-blue-300"},
        {"category": "cat2", "colour": "bg-red-300"}
    ],
	"timelines": [
        {"timelineId": "0", "timeline": [
			{"id": 1, "entity": "abc", "category": "cat1", "description": "abcd1", "start_day": 0, "start_time": 0, "duration": 60},
			{"id": 2, "entity": "def", "category": "cat1", "description": "abcd2", "start_day": 0, "start_time": 30, "duration": 70},
			{"id": 3, "entity": "abc", "category": "cat1", "description": "abcd3", "start_day": 0, "start_time": 60, "duration": 20},
			{"id": 4, "entity": "abc", "category": "cat1", "description": "abcd4", "start_day": 1, "start_time": 0, "duration": 40},
	    	{"id": 5, "entity": "def", "category": "cat1", "description": "abcd5", "start_day": 1, "start_time": 20, "duration": 30}
		]},
        {"timelineId": "1", "timeline": [
			{"id": 1, "entity": "abc", "category": "cat1", "description": "abcd1", "start_day": 0, "start_time": 0, "duration": 60},
			{"id": 2, "entity": "def", "category": "cat1", "description": "abcd2", "start_day": 0, "start_time": 30, "duration": 70},
			{"id": 3, "entity": "abc", "category": "cat1", "description": "abcd3", "start_day": 1, "start_time": 60, "duration": 20},
			{"id": 4, "entity": "abc", "category": "cat2", "description": "abcd4", "start_day": 2, "start_time": 0, "duration": 40},
	    	{"id": 5, "entity": "def", "category": "cat2", "description": "abcd5", "start_day": 1, "start_time": 20, "duration": 30}
		]}
    ]
}

```

- Does not do any fancy formatting.
- Partially generated using Claude Sonnet 4, ChatGPT, etc.