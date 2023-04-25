export const Frame = ({ children }) => {
  const outerStyling = 'flex grow justify-center';
  const innerStyling = 'flex flex-col w-[75%] max-w-3xl';
  return (
    <div className={outerStyling}>
      <div className={innerStyling}>{children}</div>
    </div>
  );
};
