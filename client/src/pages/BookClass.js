import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import SearchTutor from "../components/SearchTutor";
import "../assets/styles/BookClass.css";
import "../assets/styles/BookModal.css";
import TutorProfile from "../components/TutorProfile";
import TutorInfo from "../components/TutorInfo";
import { useSearchParams } from "react-router-dom";
import BookModal from "../components/BookModal";
import { dateHelper } from "../utils/bookDates";
import { useAuth } from "../utils/auth";

/**Yian
 * BookClass module handles Book class page rendering
 * @returns JSX of Book class UI
 */
function BookClass() {
  const [query, setQuery] = useState(null);
  const [search, setSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [render, setRender] = useState(1);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // const bookClass = useRef(new Map());
  const [bookDates, setBookDates] = useState(dateHelper(4));
  const [bookClassMap, setBookClassMap] = useState(new Map());
  const auth = useAuth();

  /**Yian
   * function that sets state in BookClass when search is triggered in SearchTutor.js
   * @param {string} the query string
   * @param {object} data from search result in SearchTutor.js
   */
  const handleQuery = (val, data) => {
    setQuery(val);
    setSearch(true);
    setSearchData(data);
  };

  const handleReturn = () => {
    setSearch(false);
  };

  /**Yian
   * local storage to persist state when browser is refreshed
   */
  useEffect(() => {
    try {
      const data = window.localStorage.getItem("Current_Query");
      const rend = window.localStorage.getItem("Current_Render");
      const currData = window.localStorage.getItem("Current_Data");
      if (data !== null && data !== "null") {
        setQuery(JSON.parse(data));
        setSearch(true);
      }
      if (rend !== null && rend !== "null") {
        setRender(rend);
      }
      if (currData !== null && currData !== "null") {
        setSearchData(JSON.parse(currData));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  /**Yian
   * function to help persist state with local storage
   */
  useEffect(() => {
    try {
      if (query) {
        window.localStorage.setItem("Current_Query", JSON.stringify(query));
        if (render) {
          window.localStorage.setItem("Current_Render", JSON.stringify(render));
        }
        if (searchData) {
          window.localStorage.setItem(
            "Current_Data",
            JSON.stringify(searchData)
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [query, render]);

  /**Yian
   * function that clears local storage key "Current_Query" when back button is clicked on browser
   */
  useEffect(() => {
    try {
      const onBackButtonEvent = (evt) => {
        evt.preventDefault();
        console.log("CLICKED");
        window.localStorage.removeItem("Current_Query");
        window.localStorage.removeItem("Current_Render");
        window.localStorage.removeItem("Current_Data");
        setSearch(false);
        setQuery(null);
        setSearchData([]);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      //cleanup (unmount)
      return () => {
        window.localStorage.clear();
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    } catch (err) {
      console.error(err);
    }
  }, []);

  /**Yian
   * render flag values: 1->SearchTutor component, 2->TutorProfile, 3->TutorInfo
   * function that decides which component to render
   */
  useEffect(() => {
    try {
      if (search && query) {
        setRender(2);
      } else if (!search) {
        setRender(1);
      } else {
        setRender(3);
      }
    } catch (err) {
      console.error(err);
    }
  }, [search]);
  console.log("render", render);
  console.log("search", search);

  //sets render to 3 when called
  const searchProfile = (profile) => {
    setRender(3);
    setTutorProfile(profile);
    setSearchParams(profile._id);
  };

  //when called sets render to value 2
  const returnToSearch = () => {
    setRender(2);
  };

  /**
   * toggle function for modal
   * book modal can only be opened when signed-in
   */
  const handleModal = () => {
    if (auth.user) {
      console.log("open modal");
      setModalIsOpen(!modalIsOpen);
    } else {
      alert("Please sign in to book class");
    }
  };

  /**Yian
   * this function simulates booking date for tutors by calling dateHelper() function from bookDates.js
   * which generates random dates for users to select book time
   */
  useEffect(() => {
    try {
      if (tutorProfile) {
        const newArr = new Set(dateHelper(4));
        setBookDates([...newArr]);
        console.log("BOOKDATES", bookDates);
      }
    } catch (err) {
      console.error(err);
    }
  }, [modalIsOpen]);

  /**Yian
   * function that renders component based on render flag value
   * @returns component for rendering
   */
  const renderFunc = () => {
    if (render === 1) {
      return <SearchTutor handleQuery={handleQuery} search={search} />;
    } else if (render === 2) {
      console.log("RENDER2");
      return (
        <TutorProfile
          searchData={searchData}
          query={query}
          handleReturn={handleReturn}
          searchProfile={searchProfile}
        />
      );
    } else if (render === 3) {
      console.log("RENDER3");
      return (
        <TutorInfo
          tutorProfile={tutorProfile}
          searchParams={searchParams}
          returnToSearch={returnToSearch}
          handleModal={handleModal}
        />
      );
    }
  };
  //todo: update add class/delete class to backend
  console.log("bookClassMap HERE INITIAL FETCH", bookClassMap);

  /**Yian
   * this function gets the schedule of the user and maps to bookClassMap
   */
  useEffect(() => {
    try {
      const fetchSchedule = async () => {
        const res = await fetch("/api/getSchedule");
        const resSchedule = await res.json();
        console.log("resSchedule", resSchedule);
        const sched = resSchedule.data.schedule;
        console.log("SCHED", sched);
        const tempMap = new Map(bookClassMap);
        if (sched !== null && sched !== []) {
          sched.forEach((item) =>
            tempMap.set(`${item.date} ${item.time}`, item)
          );
          console.log("TEMP MAP", tempMap);
          setBookClassMap(tempMap);
        }
      };
      //only fetch schedule if user is logged in
      if (auth.user) {
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  /**
   * Yian Chen
   * @param {Map Iterator Object} schedule
   */
  const addClassBackend = async (schedule) => {
    try {
      //convert to array of objects
      const scheduleArray = Array.from(schedule);
      console.log("scheduleArr", scheduleArray);

      await fetch("/api/addClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleArray),
      });
    } catch (err) {
      console.error(err);
    }
  };

  /**Yian
   * function that adds class to bookClass
   * @param {string} date
   * @param {string} time
   */
  const addClass = (date, time) => {
    try {
      if (bookClassMap.has(`${date} ${time}`)) {
        alert("Schedule Conflict, please select a different time");
      } else {
        const tempMap = new Map(bookClassMap);
        tempMap.set(`${date} ${time}`, {
          date: date,
          time: time,
          tutor: tutorProfile.first_name,
          subject: tutorProfile.subjects
        });
        setBookClassMap(tempMap);
    
      }
    } catch (err) {
      console.error(err);
      alert(`There was an error ${err}`);
    }
  };

  /**Yian Chen
   * function that removes class from bookClassMap
   * this function is passed to BookModal as prop
   * @param {string} date
   * @param {string} time
   */
  const removeClass = (date, time) => {
    try {
      const tempMap = new Map(bookClassMap);
      tempMap.delete(`${date} ${time}`);
      setBookClassMap(tempMap);
    } catch (err) {
      console.error(err);
    }
  };

  //when confirm button is clicked, classes are added to DB
  const confirmClasses = () => {
    addClassBackend(bookClassMap.values());
    alert("Class Booked");
    setModalIsOpen(!modalIsOpen);
  };

  //Yian
  return (
    <div className="BookClassMain">
      <Navbar />
      <div className="container BookContainer">
        <div className="searchDiv">{renderFunc()}</div>

        {render === 3 ? (
          <BookModal
            open={modalIsOpen}
            handleModal={handleModal}
            addClass={addClass}
            removeClass={removeClass}
            confirmClasses={confirmClasses}
            tutorProfile={tutorProfile}
            bookDates={bookDates}
            bookClassMap={bookClassMap}
          />
        ) : null}
        <Outlet />
      </div>
    </div>
  );
}

export default BookClass;
