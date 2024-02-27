import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDocs, Timestamp } from "firebase/firestore";
import { BoardHeadercontext } from "../context/BoardContext";

interface FormType {
  uid: string;
  displayName: string;
  timeData: Timestamp;
  title: string;
  content: string;
  isModify: boolean;
  index: string;
}
const initialUserForm: FormType[] = [
  {
    uid: "",
    displayName: "",
    timeData: Timestamp.now(),
    title: "",
    content: "",
    isModify: false,
    index: "",
  },
];
const Board = () => {
  const { userCollection, userLogin } = useContext(BoardHeadercontext);
  const nav = useNavigate();
  const handleWirtebtn = () => {
    nav("/write");
  };
  const [userDataBoard, setUserData] = useState(initialUserForm);
  //페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const userData = async () => {
    const userDocRef = await getDocs(userCollection);
    const newData = userDocRef.docs.map((item) => {
      const data = item.data() as FormType;
      const boardItem = {
        uid: data.uid,
        displayName: data.displayName,
        timeData: data.timeData,
        title: data.title,
        content: data.content,
        isModify: data.isModify,
        index: data.index,
      };
      return boardItem;
    });
    setUserData(newData);
  };

  const itemsPerPage = 5; //데이터 출력 개수
  const getItemsForPage = (page: number) => {
    const startIndex = (page - 1) * itemsPerPage; //보여줄 데이터 처음
    const endIndex = startIndex + itemsPerPage; //보여줄 데이터 마지막
    return userDataBoard.slice(startIndex, endIndex); //데이터 전체
  };
  useEffect(() => {
    userData();
    getItemsForPage(currentPage);
  }, [currentPage]);

  const handlerenderPagenation = () => {
    const totalPages = Math.ceil(userDataBoard.length / itemsPerPage);

    const pageGroup = Math.ceil(currentPage / 5); // 현재 페이지가 속한 페이지 그룹 계산
    const first = (pageGroup - 1) * 5 + 1; // 현재 페이지 그룹의 첫 번째 페이지 번호 계산
    const last = Math.min(pageGroup * 5, totalPages); // 현재 페이지 그룹의 마지막 페이지 번호 계산

    const paginationNumberGroup = [];
    for (let i = first; i <= last; i++) {
      paginationNumberGroup.push(
        <li key={i} onClick={() => setCurrentPage(i)}>
          {i}
        </li>
      );
    }
    return paginationNumberGroup;
  };

  const timeFuc = (timestamp: Timestamp) => {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };
  return (
    <div className="">
     
      <ul className="mt-6">
        <li className="bg-slate-200 mb-2 text-sm p-2 justify-between rounded flex">
          <div>No.</div>
          <div>제목</div>
          <div>작성일/작성자</div>
        </li>
      </ul>
      <div className="m-1">
        <ul>
          {getItemsForPage(currentPage).map((item, index) => {
            console.log(typeof item.timeData);
            const timestamp = item.timeData as Timestamp;
            return (
              <li
                key={index}
                className="items-center cursor-pointer mb-2 rounded p-5 border-solid border-indigo-400 customBorder flex hover:bg-blue-100"
              >
                <Link
                  to={`/page/${item.index}`}
                  className="flex flex-1  justify-between items-center "
                >
                  <div className="flex-none w-14 ">{index}</div>
                  <div className="w-72 truncate text-center">{item.title}</div>
                  <div className="flex-none text-xs text-slate-500 ">
                    <span className="mr-1.5">{timeFuc(timestamp)}</span>
                    <span>{item.displayName}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="text-right">
        {userLogin.uid ? (
          <button onClick={handleWirtebtn} className="common_btn_up">
            글쓰기
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className="mt-8">
        <ul className="w-1/5 m-auto justify-between flex">
          {/* {className="group bg-white w-6 h-6 rounded-md text-center hover:bg-indigo-700 "} */}
          <li>
            <span
              // className="group-hover:text-white "
              onClick={() => {
                if (currentPage > 1 && userDataBoard.length > 0) {
                  setCurrentPage(currentPage - 1);
                }
              }}
            >
              이전cc
            </span>
          </li>
          {handlerenderPagenation()}
          <li>
            <span
              onClick={() => {
                setCurrentPage(currentPage + 1);
              }}
            >
              다음
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Board;
