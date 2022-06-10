import React from "react";
import { Box } from "@mui/material";
import { Test } from "mocha";
import { TestResult } from "./TestResult";

interface IProps {
	tests: Test[];
}

export const TestResults = ({ tests }: IProps) => (
	<Box
		sx={{
			display: "grid",
			gap: 2,
			minHeight: "0",
			overflow: "auto",
		}}
	>
		{tests.map((test, index) => (
			<TestResult key={index} test={test} />
		))}
		<pre>
		{tests.map((test, index) => (
			<React.Fragment key={index}>{test.parent?.title} - {test.title} ({test.state}){"\n"}{test.err?.message}{"\n"}{"\n"}</React.Fragment>
		))}
		</pre>
	</Box>
);
