import React, { useEffect, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import { TestSummary } from "./TestSummary";
import { PlayArrowRounded } from "@mui/icons-material";
import { Stats, Test } from "mocha";
import { initAllTests, runTests } from "@fdc3-conformance-framework/tests";
import { TestsStatus } from "./TestRunner";

const statuses = {
	idle: 'Run Tests',
	running: 'Running Tests',
}

interface IProps {
  addTestHandler: (test: Test) => void;
  resetTestsHandler: () => void;
}

export const TestRunnerHeader = ({ addTestHandler, resetTestsHandler }: IProps) => {
  const [status, setStatus] = useState<TestsStatus>('idle');
	const [successfulTests, setSuccessfulTests] = useState<number>(0);
	const [failedTests, setFailedTests] = useState<number>(0);
	const [total, setTotal] = useState<number>(1);
	const [testStats, setTestStats] = useState<Stats | null>(null);
	const [testsInitialised, setTestInitialised] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const completion = Math.floor(((successfulTests + failedTests) / total) * 100);

	const reset = () => {
		resetTestsHandler();
		setSuccessfulTests(0);
		setFailedTests(0);
		setTestStats(null);
	};

	useEffect(() => {
		if (!testsInitialised) {
			initAllTests();
			setTestInitialised(true);
		}
	}, []);

  useEffect(() => {
    if (completion !== 100) return

    const hideProgressAfterDelay = setTimeout(() => {
      setShowProgress(false)
    }, 500)

    return () => {
      clearTimeout(hideProgressAfterDelay)
    }
  }, [completion])

	const reportStart = (runner: any): void => {
		reset();
		setStatus('running');
		setTotal(runner.total);
    setShowProgress(true);
	};

	const reportFailure = (test: any): void => {
		addTestHandler(test);
		setFailedTests((prev) => prev + 1);
	};

	const reportSuccess = (test: any) => {
		addTestHandler(test);
		setSuccessfulTests((prev) => prev + 1);
	};

	const reportComplete = (stats: any): void => {
		setStatus('idle');
		setTestStats(stats.stats);
	};

	const handRunTests = () => {
		runTests({
			onStart: reportStart,
			onFail: reportFailure,
			onPass: reportSuccess,
			onComplete: reportComplete,
		});
	};

	return (
    <Box
			sx={{
        position: 'sticky',
        top: 0,
			}}
		>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
					py: 2,
					backgroundColor: 'white',
					boxShadow: '0 0 0.5rem 1rem white',
        }}
      >
        <LoadingButton
          color="primary"
          onClick={handRunTests}
          endIcon={<PlayArrowRounded/>}
          loading={status === 'running'}
          loadingPosition="end"
          variant="contained"
        >
          {statuses[status]}
        </LoadingButton>

        <TestSummary status={status} successfulTests={successfulTests} failedTests={failedTests} testStats={testStats}/>
      </Box>
      
      {showProgress &&
        <LinearProgress
          variant="determinate"
          value={completion}
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
          }}
        />
      }
    </Box>
	);
};
