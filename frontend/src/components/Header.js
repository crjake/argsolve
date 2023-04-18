import { TbGavel } from 'react-icons/tb';

function Header(props) {
  return (
    <div className="flex w-full justify-center h-16 border-b-2">
      <div className="flex flex-row items-center w-[75%] max-w-3xl justify-between">
        <div className="flex">
          <TbGavel className="text-4xl" />
          <div className="m-1 text-2xl">ArgSolve</div>
        </div>
        <p>{props.username}</p>
      </div>
    </div>
  );
}

export default Header;
