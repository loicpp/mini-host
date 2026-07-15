from abc import ABC, abstractmethod

class ProjectorPort(ABC):
    @abstractmethod
    def open_window(self, game_id: str) -> None:
        pass

    @abstractmethod
    def close_window(self) -> None:
        pass
