import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { TestRunner } from "./TestRunner";

export const AgentTests = () => (
	<Box
		sx={{
			flexGrow: 1,
		}}
	>
		<Stack gap={2}>
			<Box>
				<Typography variant="h5">FDC3 Agent Compliance Test</Typography>
				<Typography>Tests which parts of the FDC3 specification the current desktop agent has implemented.</Typography>
			</Box>

			<TestRunner />
		</Stack>
	</Box>
);
