import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Stats } from "mocha";
import { useTimer } from "../hooks/useTimer";
import { TestsStatus } from "./TestRunner";
import { AccessTimeRounded, CheckRounded, CloseRounded } from "@mui/icons-material";

interface IProps {
	status: TestsStatus;
	successfulTests: number;
	failedTests: number;
	testStats: Stats | null;
}

export const TestSummary = ({ status, successfulTests, failedTests, testStats }: IProps) => {
	const { timer, start, stop, reset } = useTimer();

	useEffect(() => {
		if (status === "running") {
			reset();
			start();
		}
		if (status === "idle") {
			stop();
		}
	}, [status]);

	return (
		<Box
			sx={{
				display: "flex",
				gap: 3,
				alignItems: "center",
			}}
		>
			<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
				<CheckRounded color="success" fontSize="small"/>
				<Typography variant="overline" sx={{ fontSize: 'x-small', fontWeight: 'bold', color: '#acb2c0' }}>
					Passed:
				</Typography>
				<Typography sx={{ margin: 0 }}>{successfulTests}</Typography>
			</Box>

			<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
			<CloseRounded color="error" fontSize="small" />
				<Typography variant="overline" sx={{ fontSize: 'x-small', fontWeight: 'bold', color: '#acb2c0' }}>
				Failed:
				</Typography>
				<Typography sx={{ margin: 0 }}>{failedTests}</Typography>
			</Box>

			<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
			<AccessTimeRounded color="primary" fontSize="small" />
				<Typography variant="overline" sx={{ fontSize: 'x-small', fontWeight: 'bold', color: '#acb2c0' }}>
				Duration:
				</Typography>
				<Typography sx={{ margin: 0 }}>{testStats ? testStats.duration : timer}ms</Typography>
			</Box>
		</Box>
	);
};
