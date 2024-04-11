const { createStore, applyMiddleware } = require("redux");
const thunkMiddleware = require("redux-thunk").thunk; // Import the default export of redux-thunk

const axios = require("axios");

const FETCH_TODOS_REQUEST = "FETCH_TODOS_REQUEST";
const FETCH_TODOS_SUCCESS = "FETCH_TODOS_SUCCESS";
const FETCH_TODOS_ERROR = "FETCH_TODOS_ERROR"; // Corrected typo here
const CREATE_TODO = "CREATE_TODO";
const READ_TODO = "READ_TODO";
const UPDATE_TODO = "UPDATE_TODO";
const DELETE_TODO = "DELETE_TODO";

const fetchTodosRequest = () => ({
  type: FETCH_TODOS_REQUEST,
});

const fetchTodosSuccess = (todos) => {
  //! consoleda fetch bo'lganda id stringda keldi, fix code:
  const fixedTodos = todos.map((todo) => ({
    ...todo,

    id: parseInt(todo.id, 10),
  }));

  return {
    type: FETCH_TODOS_SUCCESS,
    payload: fixedTodos,
  };
};

const fetchTodosError = (error) => ({
  type: FETCH_TODOS_ERROR,
  payload: error,
});
const createTodo = (todo) => ({
  type: CREATE_TODO,
  payload: todo,
});

const updateTodo = (todo) => ({
  type: UPDATE_TODO,
  payload: todo,
});

const deleteTodo = (id) => ({
  type: DELETE_TODO,
  payload: id,
});

const fetchTodos = () => {
  return async function (dispatch) {
    dispatch(fetchTodosRequest());
    try {
      const res = await axios.get("http://localhost:3001/todos");
      const data = res.data;
      dispatch(fetchTodosSuccess(data));
    } catch (err) {
      dispatch(fetchTodosError(err.message));
    }
  };
};

const initialState = {
  loading: false,
  todos: [],
  error: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TODOS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_TODOS_SUCCESS:
      return {
        loading: false,
        todos: action.payload,
        error: "",
      };
    case FETCH_TODOS_ERROR:
      return {
        loading: false,
        todos: [],
        error: action.payload,
      };
    case CREATE_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    case READ_TODO:
      return {
        ...state,
        todos: action.payload,
      };
    case UPDATE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    default:
      return state;
  }
};

const store = createStore(reducer, applyMiddleware(thunkMiddleware));
(async () => {
  await store.dispatch(fetchTodos());
  //* CREATE
  store.dispatch(createTodo({ id: 6, todo: "Walk the dog", completed: false }));
  //* DELETE
  store.dispatch(deleteTodo(2));
  //* UPDATE
  store.dispatch(
    updateTodo({ id: 1, todo: "Complete works", completed: true })
  );
})();
store.subscribe(() => console.log("Updated state: ", store.getState()));
//* READ
console.log("Initial state: ", store.getState());
