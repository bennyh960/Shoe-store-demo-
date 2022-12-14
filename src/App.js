import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import storeAPI from "./api/storeAPI";
import "./App.css";
import Spinner from "./componenets/spinner/spinner";
import Shoes from "./componenets/shoes/shoes";
import NavBar from "./componenets/navbar/navbar";
import AddNewItem from "./componenets/sellerUpdate/addNewItem";

export default class App extends Component {
  state = { storeData: [], isSpinner: true };

  //* Get
  async componentDidMount() {
    try {
      const getStoreData = await storeAPI.get();
      this.setState({ storeData: getStoreData.data, isSpinner: false });
    } catch (error) {
      console.log("Error:", error);
    }
  }

  //* Post request
  addNewProduct = async (NewProductObjToAdd) => {
    this.setState((prev) => {
      return { isSpinner: !prev.isSpinner };
    });
    try {
      const NewProduct = await storeAPI.post("", NewProductObjToAdd);

      //* update UI
      this.setState((prev) => {
        return { storeData: [...prev.storeData, NewProduct.data], isSpinner: !prev.isSpinner };
      });
    } catch (error) {
      console.log("Post Error:", error);
    }
  };

  //* Delete request
  handleDelete = async (deletedItemID) => {
    this.setState((prev) => {
      return { isSpinner: !prev.isSpinner };
    });

    const updatedItemsArr = this.state.storeData.filter((item) => {
      return item.id !== deletedItemID;
    });

    try {
      await storeAPI.delete(`/${deletedItemID}`);
      // * Update UI
      this.setState((prev) => {
        return { storeData: updatedItemsArr, isSpinner: !prev.isSpinner };
      });
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  //* PUT request
  handleEdit = async (id, name, brand, price, description, image) => {
    this.setState({ isSpinner: true });
    const findItemObjectToUpdate = this.state.storeData.find((item) => item.id === id);
    const updatedItem = { ...findItemObjectToUpdate, name: name, brand, price, description, image };

    try {
      const { data } = await storeAPI.put(`/${id}`, updatedItem);
      // * Update UI
      this.setState((prev) => {
        return {
          storeData: prev.storeData.map((item) => {
            if (item.id === id) {
              return data;
            }
            return item;
          }),
          isSpinner: !prev.isSpinner,
        };
      });
    } catch (error) {
      console.log("Error PUT request:", error);
    }
  };

  //* UI - HomePage
  drawItems = (isUpdate) => {
    return this.state.storeData.map(({ name, id, price, image, brand, description }) => {
      return (
        <Shoes
          key={id}
          name={name}
          id={id}
          price={price}
          image={image}
          brand={brand}
          description={description}
          container={"shoe-container"}
          update={isUpdate}
          handleDelete={this.handleDelete}
          handleEdit={this.handleEdit}
        />
      );
    });
  };
  //* UI - Extra for UX
  drawOneItem = () => {
    return this.state.storeData.map(({ name, id, price, image, brand, description }) => {
      return (
        <Route path={`/${id}`} key={id}>
          <h2 style={{ marginTop: "3rem" }}>{name}</h2>
          <Shoes
            name={name}
            id={id}
            price={price}
            image={image}
            brand={brand}
            description={description}
            container={"shoe-container-one-item"}
            handleInputEditItem={this.handleInputEditItem}
          />
          <h4>{description}</h4>
        </Route>
      );
    });
  };

  render() {
    if (this.state.isSpinner) {
      return (
        <>
          <BrowserRouter>
            <NavBar />
          </BrowserRouter>
          <Spinner />
        </>
      );
    } else {
      return (
        <BrowserRouter>
          <NavBar />
          {/* <Switch> */}
          {this.state.isSpinner && <Spinner />}
          <Route path={"/"} exact>
            <h1 style={{ textAlign: "center" }}>Brand New</h1>
            <div className="store-container">{this.drawItems(false)}</div>
          </Route>
          <Route path={"/update"} exact>
            <h1 style={{ textAlign: "center", margin: "2rem" }}>Store Update</h1>
            <AddNewItem addNewItem={this.addNewProduct} />
            <div className="store-container-update">{this.drawItems(true)}</div>
          </Route>

          <div className="shoe-container-one-item">{this.drawOneItem()}</div>

          {/* </Switch> */}
        </BrowserRouter>
      );
    }
  }
}
