import pytest
from unittest.mock import Mock
from core.animator_api import AnimatorApi
from core.ports.storage_port import StoragePort
from core.ports.projector_port import ProjectorPort

@pytest.fixture
def mock_storage():
    return Mock(spec=StoragePort)

@pytest.fixture
def mock_projector():
    return Mock(spec=ProjectorPort)

@pytest.fixture
def api(mock_storage, mock_projector, mocker):
    mocker.patch('core.animator_api.MusicManager')
    return AnimatorApi(mock_storage, mock_projector)

def test_save_config(api, mock_storage):
    result = api.save_config({"test": "data"})
    mock_storage.save_config.assert_called_once_with({"test": "data"})
    assert result == {"status": "ok"}

def test_load_config(api, mock_storage):
    mock_storage.load_config.return_value = {"key": "value"}
    assert api.load_config() == {"key": "value"}

def test_save_playlists(api, mock_storage):
    result = api.save_playlists([{"id": 1}])
    mock_storage.save_playlists.assert_called_once_with([{"id": 1}])
    assert result == {"status": "ok"}

def test_open_projector_window(api, mock_projector):
    result = api.open_projector_window("game123")
    mock_projector.open_window.assert_called_once_with("game123")
    assert result == {"status": "ok"}

def test_close_projector_window(api, mock_projector):
    result = api.close_projector_window()
    mock_projector.close_window.assert_called_once()
    assert result == {"status": "ok"}
