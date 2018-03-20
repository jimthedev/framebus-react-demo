import React from "react";
import { render } from "react-dom";
import FlipMove from "react-flip-move";
import bus from "framebus";
const uuidv1 = require("uuid/v1");

const innerTarget = "https://localhost:3000";

const outerTarget = "https://localhost:3001";

const targets = {
  [innerTarget]: "inner",
  [outerTarget]: "outer",
  "*": "(*, not secure)"
};

const emitMessageToInner = ({ target }) => {
  bus.target(target).emit("message", {
    id: uuidv1(),
    from: "outer",
    to: targets[target],
    action: {
      type: "ack",
      payload: "outer emitted generic message"
    }
  });
};

const emitClearLogs = ({ target }) => {
  bus.target(target).emit("message", {
    id: uuidv1(),
    from: "outer",
    to: targets[target],
    action: {
      type: "clear",
      payload: "outer requested logs be cleared"
    }
  });
};

class MessageBusLog extends React.Component {
  state = {
    messages: []
  };
  componentDidMount() {
    bus.on("message", data => {
      console.log("In inner", data.from + " said: " + data.contents);

      if (data && data.action && data.action.type === "clear") {
        this.setState(state => {
          return {
            messages: [data]
          };
        });
        return;
      }

      this.setState(state => {
        return {
          messages: [].concat([data], state.messages.slice())
        };
      });
    });
  }
  render() {
    return (
      <div
        style={{
          position: "relative",
          overflowX: "scroll",
          width: "50vw",
          height: "100vh",
          paddingBottom: "50px"
        }}
      >
        <FlipMove
          duration={300}
          typeName={null}
          leaveAnimation="accordionVertical"
          staggerDurationBy={30}
          staggerDelayBy={10}
        >
          {this.state.messages.map((message, i) => (
            <pre
              style={{
                textAlign: "left",
                paddingLeft: "20px",
                wordBreak: "break-all",
                fontSize: "10px",
                color:
                  message.action && message.action.type === "clear"
                    ? "#ccc"
                    : "black"
              }}
              key={message.id}
            >
              {JSON.stringify(message, null, 4)}
            </pre>
          ))}
        </FlipMove>
      </div>
    );
  }
}

const styles = {
  width: "100%",
  fontFamily: "sans-serif",
  textAlign: "center",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start"
};
class App extends React.Component {
  state = {
    target: innerTarget
  };
  render() {
    return (
      <div style={styles}>
        <div
          style={{
            position: "fixed",
            zIndex: 100,
            top: "0px",
            fontSize: "30px",
            width: "30px",
            margin: "0 auto",
            textAlign: "center",
            letterSpacing: "-15px",
            left: "calc(50% - 50px)"
          }}
        >
          {this.state.target === innerTarget &&
          this.state.target !== outerTarget
            ? String.fromCharCode(0x2198)
            : null}
          {this.state.target === outerTarget &&
          this.state.target !== innerTarget
            ? String.fromCharCode(0x2193)
            : null}
          {this.state.target !== outerTarget &&
          this.state.target !== innerTarget
            ? String.fromCharCode(0x2193) + "" + String.fromCharCode(0x2198)
            : null}
        </div>
        <div style={{ minWidth: "50%" }}>
          <div
            style={{
              backgroundColor: "#efefef",
              position: "fixed",
              top: 0,
              width: "50%",
              zIndex: 10,
              textAlign: "right",
              paddingRight: "50px"
            }}
          >
            <h6 style={{ margin: 0 }}>
              Outer frame emits to
              <select
                onChange={e => {
                  this.setState({ target: e.target.value });
                }}
              >
                {Object.keys(targets).map(key => (
                  <option value={key}>{targets[key]}</option>
                ))}
              </select>
            </h6>
            <button
              onClick={() => emitMessageToInner({ target: this.state.target })}
            >
              Emit message
            </button>
            <button
              onClick={() => emitClearLogs({ target: this.state.target })}
            >
              Clear
            </button>
          </div>
          <div style={{ marginTop: "40px", zIndex: 1 }}>
            <MessageBusLog />
            <div
              style={{
                zIndex: 100,
                position: "fixed",
                bottom: "10px",
                width: "50%",
                textAlign: "center",
                color: "#ccc"
              }}
            >
              OUTER FRAME
              <div style={{ fontSize: "10px" }}>{window.location.href}</div>
            </div>
          </div>
        </div>
        <div
          style={{ position: "fixed", left: "50%", top: "0", height: "100vh" }}
        >
          <iframe
            style={{
              width: "50vw",
              height: "100%",
              borderTop: "0",
              borderRight: "0",
              borderBottom: "2px"
            }}
            title="Sandbox"
            src={innerTarget}
          />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
