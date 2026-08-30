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

def test_language_change_callback(api, mock_storage):
    callback_calls = []
    api.register_language_change_callback(lambda lang: callback_calls.append(lang))
    
    api.save_config({"language": "en"})
    assert api.current_language == "en"
    assert callback_calls == ["en"]
    
    # Same language shouldn't trigger callback again
    api.save_config({"language": "en"})
    assert callback_calls == ["en"]
    
    api.save_config({"language": "fr"})
    assert api.current_language == "fr"
    assert callback_calls == ["en", "fr"]

def test_get_locale():
    from core.locales import get_locale
    fr_loc = get_locale("fr")
    assert "MiniHost - Serveur" in fr_loc["title"]
    assert "Le serveur MiniHost" in fr_loc["running_tk"]
    
    en_loc = get_locale("en")
    assert "MiniHost - Server" in en_loc["title"]
    assert "The MiniHost server is running." in en_loc["running_tk"]
    
    # Fallback to French for unknown/empty
    assert get_locale("unknown") == fr_loc
    assert get_locale("") == fr_loc

