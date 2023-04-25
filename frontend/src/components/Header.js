import { TbGavel } from 'react-icons/tb';

function Header(props) {
  return (
    <div className="flex w-full justify-center h-16 border-b-2">
      <div className="flex flex-row items-center w-[75%] max-w-3xl justify-between">
        <div className="flex items-center">
          <TbGavel className="text-2xl md:text-4xl" />
          <div className="m-1 text-lg md:text-2xl">ArgSolve</div>
        </div>
        {props.username && <p className="text-sm md:text-base border-2 px-5 py-1 rounded-full">{props.username}</p>}
      </div>
    </div>
  );
}

export default Header;
