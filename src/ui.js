import {h, render as inkRender, Component, Color} from 'ink';
import pad from 'pad';
import clear from 'cli-clear';
import keypress from 'keypress';
import termSize from 'term-size';
import figures from 'figures';
import EventEmitter from 'events';
import lodash from 'lodash';
import got from 'got';

const ev = new EventEmitter();

// class Counter extends Component {
//   constructor() {
//     super();

//     this.state = {
//       i: 0
//     };
//   }

//   render() {
//     return <Color green>{this.state.i} tests passed</Color>;
//   }

//   componentDidMount() {
//     this.timer = setInterval(() => {
//       this.setState({
//         i: this.state.i + 1
//       });
//     }, 100);
//   }

//   componentWillUnmount() {
//     clearInterval(this.timer);
//   }
// }

class Ui extends Component {
  static repoTextPad = 25;
  static repoFullPad = pad(' ', Ui.repoTextPad);
  static issueFullPad = pad(' ', 50);

  constructor(props) {
    super(props);

    if (props.repositories.length === 0) {
      return;
    }

    const reponameMaxLength = props.repositories.reduce((result, repo) => {
      return result > repo.length ? result : repo.length;
    }, 0);

    this.state = {
      area: 'repo',
      size: termSize(),
      selectedRepo: props.repositories[0],
      // selectedIssues: [],
      cursor: -1,
      choicedIssues: props.choicedIssues || [],
      reponameMaxLength
    };
  }

  isIssueAreaActive() {
    return this.state.area === 'issue';
  }

  get items() {
    return this.props.grouped[this.state.selectedRepo.trim()];
  }

  getRepoText(completedRepo) {
    return pad(completedRepo, 25);
  }

  getIssueTitle(issue, selected = false) {
    if (selected) {
      return ' ✓ ' + (issue || {issueTitle: ''}).issueTitle.slice(0, 48);
    }

    return (issue || {issueTitle: ''}).issueTitle.slice(0, 48);
  }

  getRepoGap(selected) {
    if (selected) {
      return <Color blue>{figures.pointer}</Color>;
    }

    return <Color hidden>{figures.pointer}</Color>;
  }

  getRepoText(selected, text) {
    if (selected) {
      return (
        <Color>
          {pad(text, this.state.reponameMaxLength) ||
            pad(' ', this.state.reponameMaxLength)}
        </Color>
      );
    }

    return (
      <Color gray>
        {pad(text, this.state.reponameMaxLength) ||
          pad(' ', this.state.reponameMaxLength)}
      </Color>
    );
  }

  getIssueGap(_choiced, target) {
    if (target) {
      return <Color blue>{figures.pointer}</Color>;
    }

    return (
      <Color blue hidden>
        {figures.pointer}
      </Color>
    );
  }

  getIssueText(choiced, target, text) {
    let colorProps = {white: true};
    if (choiced && target) {
      colorProps = {bgBlue: true, black: true};
    } else if (choiced) {
      colorProps = {bgBlue: true, black: true};
    } else if (target) {
      colorProps = {white: true};
    }

    return <Color {...colorProps}>{text || Ui.issueFullPad}</Color>;
  }

  getRepositoryByIndex(index) {
    return this.props.repositories[index];
  }

  getIssueByIndex(index) {
    return this.items[index];
  }

  isSelectedRepo(repo) {
    return this.state.selectedRepo === repo;
  }

  isChoicedIssue(issue) {
    return this.state.choicedIssues.includes(issue);
  }

  isTargetIssue(issue, lineNumber) {
    return this.items[lineNumber] === issue;
  }

  get header() {
    return (
      <div>
        <Color gray>{pad('', this.state.size.columns, '-')}</Color>
      </div>
    );
  }

  get footer() {
    return (
      <div>
        <div>
          <Color gray>{pad('', this.state.size.columns, '-')}</Color>
        </div>
        <div>
          <Color gray>
            {figures.arrowLeft} {figures.arrowUp} {figures.arrowDown}{' '}
            {figures.arrowRight} {'[space]'} {'[enter]'}
          </Color>
        </div>
      </div>
    );
  }

  render() {
    let lines = [];
    let i = 0;
    while (i < this.state.size.rows) {
      let repo = this.getRepositoryByIndex(i);
      let issue = this.getIssueByIndex(i);
      if (typeof repo === 'undefined' && typeof issue === 'undefined') {
        break;
      }

      if (typeof repo === 'undefined') {
        repo = '';
      }
      if (typeof issue === 'undefined') {
        issue = {};
      }

      const selectedRepo = this.isSelectedRepo(repo);
      const repoGap = this.getRepoGap(selectedRepo);
      const repoText = this.getRepoText(selectedRepo, repo.trim());
      const choicedIssue = this.isChoicedIssue(issue);
      const targetIssue = this.isTargetIssue(issue, this.state.cursor);
      const issueGap = this.getIssueGap(choicedIssue, targetIssue);
      const issueText = this.getIssueText(
        choicedIssue,
        targetIssue,
        issue.issueTitle
      );

      lines.push(
        <div key={i}>
          {repoGap}
          {repoText}
          {<Color gray> | </Color>}
          {issueGap}
          {issueText}
        </div>
      );

      i = i + 1;
    }

    return (
      <div>
        {this.header}
        {lines}
        {this.footer}
      </div>
    );
  }

  componentDidMount() {
    process.stdout.on('resize', function() {
      this.setState({
        size: termSize()
      });
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'j') {
        this.keypressJ();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'k') {
        this.keypressK();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'h') {
        this.maybeIntoRepoArea();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'l') {
        this.maybeIntoIssueArea();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      if (key && key.name == 'space') {
        this.keypressSpace();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      if (key && key.name == 'return') {
        this.keypressReturn();
      }
    });

    this.forceUpdate();
  }

  keypressJ = () => {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor < this.items.length - 1) {
        this.setState({
          cursor: this.state.cursor + 1
        });
      }

      return;
    }

    const currentIndex = this.props.repositories.findIndex(
      repo => repo === this.state.selectedRepo
    );

    if (currentIndex === this.props.repositories.length - 1) {
      return;
    }

    this.setState({
      selectedRepo: this.props.repositories[currentIndex + 1]
    });
  };

  keypressK = () => {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor > 0) {
        this.setState({
          cursor: this.state.cursor - 1
        });
      }

      return;
    }

    const currentIndex = this.props.repositories.findIndex(
      repo => repo === this.state.selectedRepo
    );

    if (currentIndex === 0) {
      return;
    }

    this.setState({
      selectedRepo: this.props.repositories[currentIndex - 1]
    });
  };

  maybeIntoRepoArea = () => {
    this.setState({
      area: 'repo',
      cursor: -1
    });
  };

  maybeIntoIssueArea = () => {
    this.setState({
      area: 'issue',
      cursor: 0
    });
  };

  keypressSpace = () => {
    if (!this.isIssueAreaActive()) {
      return;
    }

    const {choicedIssues} = this.state;
    const targetIssue = this.items[this.state.cursor];
    const index = choicedIssues.findIndex(item => item === targetIssue);
    if (index === -1) {
      choicedIssues.push(targetIssue);
    } else {
      choicedIssues.splice(index, 1);
    }

    this.setState({choicedIssues});
  };

  keypressReturn = () => {
    ev.emit('unmount', this.state.choicedIssues);
  };
}

export const render = (
  {argv, slack, repositories, grouped, choicedIssues},
  format
) => {
  setTimeout(async () => {
    if (argv.immidiate) {
      if (format === 'slack') {
        const grouped = lodash.groupBy(choicedIssues, issue => issue.repository);

        const data = {
          token: argv.slackToken,
          channel: argv.slackChannel,
          as_user: true,
          attachments: JSON.stringify(
            lodash.flatten(
              Object.keys(grouped).map(repository => {
                return grouped[repository].map(issue => {
                  return {
                    color: issue.history ? '#81888c' : '#2ea9df',
                    title: issue.issueTitle,
                    title_link: issue.url,
                    footer: JSON.stringify({
                      repository: issue.repository,
                      id: issue.id
                    })
                  };
                });
              })
            )
          )
        };

        await got.post('https://slack.com/api/chat.postMessage', {
          query: data
        });

        if (slack.isToday()) {
          await slack.deleteLatestMessage();
        }
      }

      return;
    }

    const unmount = inkRender(
      <Ui
        repositories={repositories || []}
        grouped={grouped}
        choicedIssues={choicedIssues}
      />
    );

    ev.on('unmount', async result => {
      unmount();

      if (format === 'slack') {
        const grouped = lodash.groupBy(result, issue => issue.repository);

        const data = {
          token: argv.slackToken,
          channel: argv.slackChannel,
          as_user: true,
          attachments: JSON.stringify(
            lodash.flatten(
              Object.keys(grouped).map(repository => {
                return grouped[repository].map(issue => {
                  return {
                    color: issue.history ? '#81888c' : '#2ea9df',
                    title: issue.issueTitle,
                    title_link: issue.url,
                    footer: JSON.stringify({
                      repository: issue.repository,
                      id: issue.id
                    })
                  };
                });
              })
            )
          )
        };

        await got.post('https://slack.com/api/chat.postMessage', {
          query: data
        });

        if (slack.isToday()) {
          await slack.deleteLatestMessage();
        }
      } else {
        throw new Error('不明なフォーマット');
      }
      process.exit(0);
    });
  }, 1000);
};
