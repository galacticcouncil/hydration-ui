export default {
  types: {
    ProposalRecord: {
      index: "u32",
      author: "AccountId",
      // Ignored for now, uncomment to add own type
      // stage: "VoteStage",
      transition_time: "u32",
      title: "Text",
      contents: "Text",
      vote_id: "u64",
    },
    ProposalContents: "Vec<u8>",
    ProposalTitle: "Vec<u8>",
  },
}
