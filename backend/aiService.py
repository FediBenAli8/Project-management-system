import os
import json
from groq import Groq
from dotenv import load_dotenv
import re
from models import SubTaskByAi, TaskByAi
from typing import Dict, Any
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not set in your .env file")
client = Groq(api_key=api_key)

def parse_groq_response(raw: str) -> dict:
    # Strip markdown fences
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {e}\nRaw response:\n{raw}")

def generate_project_structure(title: str, description: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a project management assistant. Always respond with valid JSON only."},
            {"role": "user", "content": f"""
Generate a project task structure for:
Title: {title}
Description: {description}

Return ONLY a valid JSON object with this exact structure:
{{
  "tasks": [
    {{
      "name": "Task name",
      "description": "Brief description",
      "weight": 30,
      "subtasks": [
        {{
          "name": "Subtask name",
          "description": "Brief description",
          "weight": 50
        }}
      ]
    }}
  ]
}}
"""}
        ],
        temperature=0.4,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content
    return parse_groq_response(raw)

def import_tasks_from_json(data: Dict[str, Any]):
    """
    Parses JSON data and returns a list of TaskByAi objects.
    """
    tasks = []
    for task_data in data.get("tasks", []):
        subtasks_list = []
        for sub_data in task_data.get("subtasks", []):
            new_subtask = SubTaskByAi(
                name=sub_data.get("name", "Unnamed Subtask")[:50],
                weight=float(sub_data.get("weight", 0))
            )
            subtasks_list.append(new_subtask)
        
        new_task = TaskByAi(
            name=task_data.get("name", "Unnamed Task")[:50],
            weight=float(task_data.get("weight", 0)),
            subtasks=subtasks_list
        )
        tasks.append(new_task)
    return tasks
    