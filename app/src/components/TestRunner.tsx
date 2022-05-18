import React, { useState } from "react";
import { Box } from "@mui/material";
import { Test } from "mocha";
import { TestResults } from "./TestResults";
import { TestRunnerHeader } from "./TestRunnerHeader";

export type TestsStatus = 'idle' | 'running'

export const TestRunner = () => {
	const [tests, setTests] = useState<Test[]>([]);

	const handleAddTest = (test: Test) => {
		setTests((prev) => [ ...prev, test ])
	}

	const handleResetTests = () => {
		setTests([])
	}

	return (
    <Box
			sx={{
				display: 'grid',
				gridTemplateRows: 'auto 1fr',
				gap: 2,
				position: 'relative',
			}}
		>
      <TestRunnerHeader
				addTestHandler={handleAddTest}
				resetTestsHandler={handleResetTests}
			/>
      <TestResults tests={tests}/>
    </Box>
	);
};
