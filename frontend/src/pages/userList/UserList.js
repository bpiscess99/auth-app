import React, { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import ChangeRole from '../../components/changeRole/ChangeRole';
import PageMenu from '../../components/pageMenu/PageMenu';
import Search from '../../components/search/Search';
import UserStats from '../../components/userStats/UserStats';
import './UserList.scss';
import { useDispatch, useSelector } from 'react-redux';
import {FILTER_USERS, selectUsers} from "../../redux/features/auth/filterSlice";
import { deleteUser, getUsers } from '../../redux/features/auth/authSlice';
import {Spinner} from "../../components/loader/Loader";
import {confirmAlert} from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import ReactPaginate from "react-paginate";
import {shortenText} from "../profile/Profile"
import useRedirectLoggedOutUser from '../../customHook/useRedirectLoggedOutUser';

const UserList = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();
  
  const [search, setSearch] = useState("");

  const {users, isLoading, isLoggedIn, isSuccess, message} = useSelector((state) => state.auth);
  const filteredUsers = useSelector(selectUsers);
  console.log("filtered Users", filteredUsers);
  // console.log("users", users)

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch])

  const removeUser = async (id) => {
    await dispatch(deleteUser(id));
    dispatch(getUsers());
  };

  const confirmDelete = async(id) => {
    confirmAlert({
      title: "Delete This User",
      message: "Are you sure to delete this user?",
      buttons: [
        {
          label: "Delete",
          onClick: () => removeUser(id),
        },
        {
          label: "Cancel",
          onClick: () => alert("Click No")
        }
      ],
    });
  };

  useEffect(() => {
    console.log("Dispatching FILTER_USERS with payload:", {users, search});

    dispatch(FILTER_USERS({users, search}))
  }, [dispatch, users, search]);
  
  // Begin Paginate
  const itemsPerPage = 5;
  const [itemOffset, setItemOffset] = useState(0);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredUsers.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredUsers.length;
    setItemOffset(newOffset);
  };

  return (
    <section>
      <div className="container">
        <PageMenu/>
        <UserStats/>
        
        <div className="user-list">
        {isLoading && <Spinner/>} 
         <div className="table">
         
         <div className="--flex-between">
          <span>
            <h3>All Users</h3>
          </span>
          <span>
         <Search 
         value={search}
         onChange={(e) => setSearch(e.target.value)}
         />
          </span>
         </div>
         {!isLoading && users.length === 0 ? (
          <p>No user found...</p>
         ): (
        <table>
          <thead>
          <tr>
            <th>s/n</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
            {currentItems.map((user, index) => {
              const {_id, name, email, role} = user;
              
              return(
            <tr key={_id}>
              <td>{index + 1}</td>
              <td>{shortenText(name, 8)}</td>
              <td>{email}</td>
              <td>{role}</td>
              <td>
                <ChangeRole _id={_id} email={email}/>
              </td>
              <td>
                <span>
                  <FaTrashAlt 
                  size={20} 
                  color="red"
                  onClick={() => confirmDelete(_id)}
                  />
                </span>
              </td>
            </tr>
            )
          })}
          </tbody>
        </table>
       )}
       <hr/>
        </div>
         <ReactPaginate
         breakLabel="..."
         nextLabel="Next"
         onPageChange={handlePageClick}
         pageRangeDisplayed={3}
         pageCount={pageCount}
         previousLabel="Prev"
         renderOnZeroPageCount={null}
         containerClassName='pagination'
         pageLinkClassName='page-num'
         previousLinkClassName='page-num'
         activeClassName='activePage'
         />
        </div>

      </div>
    </section>
  )
}

export default UserList
