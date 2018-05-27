import {h, render as inkRender, Component, Color} from 'ink';
import pad from 'pad';
import clear from 'cli-clear';
import keypress from 'keypress';
import size from 'window-size';

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
  constructor(props) {
    super(props);

    if (props.repositories.length === 0) {
      return;
    }

    this.state = {
      area: 'repo',
      size: size.get(),
      selectedRepo: props.repositories[0],
      cursor: 0,
      choiceIssues: []
    };
  }

  isIssueAreaActive() {
    return this.state.area === 'issue';
  }

  get items() {
    // console.log(this.props.grouped[this.state.selectedRepo.trim()])
    return this.props.grouped[this.state.selectedRepo.trim()];
  }

  getIssueTitle(issue) {
    return (issue || {issueTitle: ''}).issueTitle.slice(0, 48);
  }

  render() {
    return (
      <div>
        {([...this.props.repositories] || []).map((repo, i) => {
          if (this.state.selectedRepo === repo) {
            return (
              <div key={repo}>
                <Color blue>{'*' + repo}</Color>{' '}
                {this.isIssueAreaActive() && this.state.cursor === i ? (
                  <Color bgWhite white>
                    this.getIssueTitle(this.items[i])
                  </Color>
                ) : (
                  this.getIssueTitle(this.items[i])
                )}
              </div>
            );
          }
          return (
            <div key={repo}>
              {repo}{' '}
              {this.isIssueAreaActive() && this.state.cursor === i ? (
                <Color bgWhite black>
                  this.getIssueTitle(this.items[i])
                </Color>
              ) : (
                this.getIssueTitle(this.items[i])
              )}
            </div>
          );
        })}

        {this.props.repositories.length < this.items.length &&
          this.items.slice(this.props.repositories.length - 1).map(item => {
            return (
              <div key={item.id}>
                {pad(25, '') + ' ' + this.getIssueTitle(item)}
              </div>
            );
          })}
      </div>
    );
  }

  componentDidMount() {
    process.stdout.on('resize', function() {
      this.setState({
        size: size.get()
      });
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'j') {
        this.maybeSelectNextRepo();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'k') {
        this.maybeSelectPrevRepo();
      }
    });

    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'l') {
        this.maybeIntoIssueArea();
      }
    });

    this.forceUpdate();
  }

  maybeSelectNextRepo() {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor < this.items.length - 1) {
        this.setState({
          cursor: this.state.cursor + 1,
        })
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
  }

  maybeSelectPrevRepo() {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor > 1) {
        this.setState({
          cursor: this.state.cursor - 1,
        })
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
  }

  maybeIntoIssueArea() {
    this.setState({
      area: 'issue',
      cursor: 0
    });
  }
}

export const render = ({repositories, grouped}) => {
  setTimeout(() => {
    inkRender(<Ui repositories={repositories || []} grouped={grouped} />);
  }, 1000);
};
