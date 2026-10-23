import os
import json
import pytest
from unittest.mock import Mock
from core.animator_api import AnimatorApi
from core.ports.storage_port import StoragePort
from core.ports.projector_port import ProjectorPort
from infrastructure.file_storage_adapter import FileStorageAdapter

def test_file_storage_history(tmp_path):
    storage = FileStorageAdapter(config_dir=str(tmp_path))
    history_file = tmp_path / "history.jsonl"
    
    # 1. Loading with no file returns empty list
    assert storage.load_history() == []
    assert not history_file.exists()

    # 2. Saving entries
    entry1 = {
        "id": "GAME_1",
        "endedAt": "2026-10-23T10:00:00.000Z",
        "players": [
            {"position": 1, "name": "Alice", "score": 20},
            {"position": 2, "name": "Bob", "score": 15}
        ]
    }
    storage.save_history_entry(entry1)
    assert history_file.exists()

    entry2 = {
        "id": "GAME_2",
        "endedAt": "2026-10-23T11:00:00.000Z",
        "players": [
            {"position": 1, "name": "Charlie", "score": 30}
        ]
    }
    storage.save_history_entry(entry2)

    loaded = storage.load_history()
    assert len(loaded) == 2
    assert loaded[0]["id"] == "GAME_1"
    assert loaded[1]["id"] == "GAME_2"
    assert loaded[0]["players"][0]["name"] == "Alice"
    assert loaded[1]["players"][0]["name"] == "Charlie"

def test_file_storage_history_corrupted_line(tmp_path):
    storage = FileStorageAdapter(config_dir=str(tmp_path))
    history_file = tmp_path / "history.jsonl"

    with open(history_file, "w", encoding="utf-8") as f:
        f.write('{"id": "VALID_1", "endedAt": "2026-10-23T10:00:00.000Z", "players": []}\n')
        f.write('INVALID JSON LINE\n')
        f.write('\n')
        f.write('{"id": "VALID_2", "endedAt": "2026-10-23T11:00:00.000Z", "players": []}\n')

    loaded = storage.load_history()
    assert len(loaded) == 2
    assert loaded[0]["id"] == "VALID_1"
    assert loaded[1]["id"] == "VALID_2"

def test_api_history_empty_players_ignored(mocker):
    mock_storage = Mock(spec=StoragePort)
    mock_projector = Mock(spec=ProjectorPort)
    mocker.patch('core.animator_api.MusicManager')
    api = AnimatorApi(mock_storage, mock_projector)

    # Empty players list should not be saved
    res = api.save_history_entry({"id": "EMPTY", "players": []})
    assert res["status"] == "ignored"
    mock_storage.save_history_entry.assert_not_called()

    # Missing players key should not be saved
    res = api.save_history_entry({"id": "NO_KEY"})
    assert res["status"] == "ignored"
    mock_storage.save_history_entry.assert_not_called()

def test_api_history_sorted_by_date(mocker):
    mock_storage = Mock(spec=StoragePort)
    mock_projector = Mock(spec=ProjectorPort)
    mocker.patch('core.animator_api.MusicManager')
    api = AnimatorApi(mock_storage, mock_projector)

    mock_storage.load_history.return_value = [
        {"id": "OLD", "endedAt": "2026-10-20T10:00:00.000Z", "players": [{"name": "A", "score": 1, "position": 1}]},
        {"id": "NEW", "endedAt": "2026-10-23T15:00:00.000Z", "players": [{"name": "B", "score": 5, "position": 1}]},
        {"id": "MID", "endedAt": "2026-10-22T12:00:00.000Z", "players": [{"name": "C", "score": 3, "position": 1}]}
    ]

    loaded = api.load_history()
    assert len(loaded) == 3
    assert loaded[0]["id"] == "NEW"
    assert loaded[1]["id"] == "MID"
    assert loaded[2]["id"] == "OLD"
