import { FC } from "react";

const Dashboard: FC = () => {
  return (
    <div className="bg-black font-body text-white">
      <p className="mb-4">
        <span className="text-xl font-bold">
          Welcome to the new Pickle Finance
        </span>
      </p>
    </div>
  );
};

export { getStaticProps } from "../../util/locales";

export default Dashboard;
