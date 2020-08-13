import React, { useEffect, useState } from "react";

import { firebase } from "./firebase/firebase-config";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [todo, setTodo] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const db = firebase.firestore();
        const data = await db.collection("todos").get();

        const arrayData = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTodos(arrayData);
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, []);

  const handleChange = ({ target }) => {
    setTodo(target.value);
  };

  const addTodo = async (e) => {
    e.preventDefault();

    if (!todo.trim()) {
      console.log("Empty field");
      return;
    }

    try {
      const db = firebase.firestore();
      const newTodo = {
        name: todo,
        date: Date.now(),
      };

      const data = await db.collection("todos").add(newTodo);

      setTodos([...todos, { ...newTodo, id: data.id }]);

      setTodo("");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const db = firebase.firestore();
      await db.collection("todos").doc(id).delete();

      const filteredTodos = todos.filter((todo) => todo.id !== id);
      setTodos(filteredTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const editTodo = (todo) => {
    setEditMode(true);
    setTodo(todo.name);
    setId(todo.id);
  };

  const edit = async (e) => {
    e.preventDefault();

    if (!todo.trim()) {
      console.log("Empty field");
      return;
    }

    try {
      const db = firebase.firestore();
      await db.collection("todos").doc(id).update({
        name: todo,
      });

      const editedArray = todos.map((item) =>
        item.id === id ? { id: item.id, date: item.date, name: todo } : item
      );

      setTodos(editedArray);
      setEditMode(false);
      setTodo("");
      setId("");
    } catch (error) {
      console.log(error);
    }
  };

  const renderTodos = () => {
    return todos.map((todo) => {
      return (
        <li className="list-group-item" key={todo.id}>
          {todo.name}

          <button
            className="btn btn-danger btn-sm float-right"
            onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
          <button
            className="btn btn-warning btn-sm float-right mr-2"
            onClick={() => editTodo(todo)}>
            Edit
          </button>
        </li>
      );
    });
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-8 order-2 order-md-1">
          <ul className="list-group">{renderTodos()}</ul>
        </div>
        <div className="col-md-4 my-4 my-md-0 order-1 order-md-2">
          <h3>{editMode ? "Edit Todo" : "Add Todo"}</h3>
          <form onSubmit={editMode ? edit : addTodo}>
            <input
              type="text"
              placeholder="Add Todo"
              className="form-control mb-2"
              onChange={handleChange}
              value={todo}
              autoComplete="off"
            />

            <button
              className={
                editMode
                  ? "btn btn-warning btn-block"
                  : "btn btn-dark btn-block"
              }
              type="submit">
              {editMode ? "Edit" : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
