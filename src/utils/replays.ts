export const parseReplayData = (rawReplayData: any) => {
  // Handle bundle wrapper format: { "replay": { "steps": [...], ... } }
  if (rawReplayData.replay && rawReplayData.replay.steps) {
    return parseReplayData(rawReplayData.replay);
  }
  if (rawReplayData.steps) {
    // Spiti Exclusion Zone replay (steps at top level)
    const commands = [];
    rawReplayData.steps.forEach((stepInfo) => {
      let turnCommands = [];
      stepInfo.forEach(
        (step: { action: string[]; observation: { player: number } }) => {
          if (step.action) {
            let mappedActions = step.action.map((action) => {
              return { command: action, agentID: step.observation.player };
            });
            turnCommands.push(...mappedActions);
          }
        }
      );
      commands.push(turnCommands);
    });
    let width = rawReplayData.configuration.width;
    let height = rawReplayData.configuration.height;
    const replay = {
      allCommands: commands.slice(1), // slice 1 to remove empty first entry that represents the "observation"
      mapType: rawReplayData.configuration.mapType,
      width: width === -1 ? undefined : width,
      height: height === -1 ? undefined : height,
      seed: parseInt(rawReplayData.configuration.seed),
      teamDetails: [
        {
          name: 'team 0',
          tournamentID: '',
        },
        {
          name: 'team 1',
          tournamentID: '',
        },
      ],
      version: rawReplayData.version,
    };
    if (rawReplayData.info.TeamNames) {
      replay.teamDetails[0].name = 'Allied Drones (you)';
      replay.teamDetails[1].name = 'Enemy Drones (Enemy)';
    }
    console.log('Parsed replay meta', replay);
    console.log(`Read ${rawReplayData.steps.length} steps`);
    return replay;
  } else {
    return rawReplayData;
  }
};
