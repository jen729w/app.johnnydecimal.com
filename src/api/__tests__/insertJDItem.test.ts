import insertJDItem from "../insertJDItem";

import { testJDProject } from "../../testdata/testJDProject";
import JDItem from "../../@types/JDItem";

const newGoodJDArea: JDItem = {
	jdType: "area",
	jdNumber: "80-89",
	jdTitle: "New area 80-89",
};

const newBadJDArea: JDItem = {
	jdType: "area",
	jdNumber: "10-19",
	jdTitle: "New area 10-19",
};

test("Adding a valid area", () => {
	const result = insertJDItem(newGoodJDArea, testJDProject);
	expect(result).toBe(true);
});
test("Adding an invalid area (it already exists)", () => {
	const result = insertJDItem(newBadJDArea, testJDProject);
	expect(result).toBe(true);
});