const TitleComponent = ({ children }) => {
  return (
    <div
      style={{
        fontSize: 22,
        fontWeight: 500,
        marginBottom: 25,
      }}
      className="title-component"
    >
      {children}
    </div>
  );
};

export default TitleComponent;
