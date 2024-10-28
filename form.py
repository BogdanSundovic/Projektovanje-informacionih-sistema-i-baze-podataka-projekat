from question import Question

class Form():
    def __init__(self, form_name: str = None, form_description: str = None, private: bool = False)->None:
        pass

    def set_name(self, name: str)->None:
        self.name = name

    def set_description(self, description: str)->None:
        self.name = description

    def set_private(self, private: bool)->None:
        self.private = private

    def delete_question()->None:
        pass