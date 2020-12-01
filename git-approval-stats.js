const { exec } = require("child_process");

const command = `cd ${process.argv[2]}; git log master | awk '/Approved-by/ {print}' | sed "s/ Approved-by: //"`;

const execute = (command, callback) => {
  exec(command, function (error, stdout, stderr) {
    callback(stdout);
  });
};

execute(command, (approvalList) => {
  const lookup = new Map();

  const names = approvalList
    .split("\n")
    .map((name) =>
      name
        .replace(/<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)>/gi, "")
        .trim()
    );

  names.forEach((name) => {
    if (!name) {
      return;
    }

    if (lookup.has(name)) {
      const currentNumber = lookup.get(name);
      lookup.set(name, currentNumber + 1);
    } else {
      lookup.set(name, 1);
    }
  });

  const sortingArray = [];

  lookup.forEach((value, key) =>
    sortingArray.push({ author: key, stat: value })
  );

  const sorted = sortingArray
    .sort((a, b) => (a.stat > b.stat ? 1 : -1))
    .reverse();

  console.log("Your top 50 reviewers are:");

  for (let i = 0; i < 50; i++) {
    console.log(
      `  ${i + 1}. ${sorted[i].author} (${sorted[i].stat} approvals)`
    );
  }
});
