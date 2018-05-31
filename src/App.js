import React, { Component } from 'react';
import ToolbarComponent from './components/ToolbarComponent'
import MessagesComponent from './components/MessagesComponent'
import ComposeMessageComponent from './components/ComposeMessageComponent'

class App extends Component {

  // ================================================
  // STATE
  // ================================================
  
  // state = {
  //   messages: this.props.messages
  // };

  state = {
    messages: []
  }

  // ================================================
  // React Life Cycle
  // ================================================
  componentDidMount = async () => {
    const response = await fetch('http://localhost:8082/api/messages')
    const messages = await response.json()

    this.setState({
      messages: [
        ...this.state.messages,
        ...messages.map(message => ({
          ...message,
          selected: false
        }))
      ],
      display: false
    })
  }

  // ================================================
  // Toggle Compose
  // ================================================
  toggleCompose = () => {
    this.setState({ display: !this.state.display })
  }

  // ================================================
  // Toggle Select All
  // ================================================
  toggleSelectAll = () => {
    const selectedMessages = this.state.messages.filter(message => message.selected)

    const selected = selectedMessages.length !== this.state.messages.length
    this.setState({
      messages: this.state.messages.map(message => message.selected !== selected ? { ...message, selected } : message)
    })
  }

  // ================================================
  // Toggle Property
  // ================================================
  // toggleProperty(message, property) {
  //   const index = this.state.messages.indexOf(message);
  //   this.setState({
  //     messages: [
  //       ...this.state.messages.slice(0, index),
  //       {...message, [property]: !message[property]},
  //       ...this.state.messages.slice(index + 1)
  //     ]
  //   });
  // }

  toggleProperty = async (message, property) => {
    const index = this.state.messages.indexOf(message)

    this.setState({
      messages: [
        ...this.state.messages.slice(0, index),
        { ...message, [property]: !message[property] },
        ...this.state.messages.slice(index + 1)
      ]
    })
  }

  // ================================================
  // Toggle Start
  // ================================================
  // toggleStar = message => {
  //   this.toggleProperty(message, 'starred');
  // }

  toggleStar = async message => {
    await fetch('http://localhost:8082/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({
        messageIds: [message.id],
        command: 'star',
        star: message.starred
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.toggleProperty(message, 'starred')
  }

  // ================================================
  // Toggle Select
  // ================================================
  toggleSelect = message => {
    this.toggleProperty(message, 'selected');
  }

  // ================================================
  // Mark Read Status
  // ================================================
  // markReadStatus = readStatus => {
  //   this.setState({
  //     messages: this.state.messages.map(
  //       message =>
  //       message.selected ? {...message, read: readStatus} : message
  //     )
  //   })
  // }

  markReadStatus = async readStatus => {
    // Filter out the selected messages
    const selectedMessages = this.state.messages.filter(message => message.selected)

    await fetch('http://localhost:8082/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({
        messageIds: [...selectedMessages.map(message => message.id)],
        command: 'read',
        read: readStatus
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setState({
      messages: this.state.messages.map(message => (message.selected ? {...message, read: readStatus} : message))
    })
  }

  // ================================================
  // Add Message
  // ================================================
  addMessage = async (composeMessage) => {
    const { subject, body } = composeMessage
    const response = await fetch('http://localhost:8082/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        body
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const message = await response.json()
    // console.log('messages==> ', this.state.messages);
    // console.log('new message==> ', message);

    this.setState({
      messages: [
        ...this.state.messages,
        message
      ],
      display: !this.state.display
    })
    console.log(this.state);
  }

  // ================================================
  // Delete Messages
  // ================================================
  // deleteMessages = () => {
  //   const messages = this.state.messages.filter(
  //     messages => !messages.selected
  //   );
  //   this.setState({messages})
  // }

  deleteMessages = async () => {
    const messages = this.state.messages.filter(message => !message.selected);
    // Filter out the selected messages
    const selectedMessages = this.state.messages.filter(message => message.selected)

    await fetch('http://localhost:8082/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({
        messageIds: [...selectedMessages.map(message => message.id)],
        command: 'delete'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setState({ messages })
  }

  // ================================================
  // Apply Label Category
  // ================================================
  // applyLabel = label => {
  //   const messages = this.state.messages.map(message => 
  //     message.selected && !message.labels.includes(label) ? 
  //     {...message, labels: [...message.labels, label].sort()}
  //     : message
  //   );
  //   this.setState({messages})
  // };

  applyLabel = async label => {
    const messages = this.state.messages.map(message =>
      message.selected && !message.labels.includes(label)
        ? {...message, labels: [...message.labels, label].sort()}
        : message
    )
    // Filter out the selected messages
    const selectedMessages = this.state.messages.filter(message => message.selected)

    await fetch('http://localhost:8082/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({
        messageIds: [...selectedMessages.map(message => message.id)],
        command: 'addLabel',
        label
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setState({ messages })
  }

  // ================================================
  // Remove Label
  // ================================================
  // removeLabel = label => {
  //   const messages = this.state.messages.map(
  //     message => {
  //       const index = message.labels.indexOf(label)
  //       if (message.selected && index > -1) {
  //         return {...message, labels: [
  //           ...message.labels.slice(0, index),
  //           ...message.labels.slice(index + 1)
  //           ]
  //         }
  //       }
  //       return message;
  //     });
  //   this.setState({messages})
  // };

  removeLabel = async label => {
    const messages = this.state.messages.map(message => {
      const index = message.labels.indexOf(label)
      if (message.selected && index > -1) {
        return {
          ...message,
          labels: [
            ...message.labels.slice(0, index),
            ...message.labels.slice(index + 1)
          ]
        }
      }
      return message
    })
    // Filter out the selected messages
    const selectedMessages = this.state.messages.filter(message => message.selected)

    await fetch('http://localhost:8082/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({
        messageIds: [...selectedMessages.map(message => message.id)],
        command: 'removeLabel',
        label
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setState({ messages })
  }

  // ================================================
  // Render
  // ================================================
  render() {
    // console.log(this.state)
    return (    
      <div className="App">
        <ToolbarComponent 
          messages={this.state.messages}
          toggleCompose={this.toggleCompose}
          toggleSelectAll={this.toggleSelectAll}
          markReadStatus={this.markReadStatus}
          deleteMessages={this.deleteMessages}
          applyLabel={this.applyLabel}
          removeLabel={this.removeLabel}
        />
        <ComposeMessageComponent
          display={this.state.display}
          addMessage={this.addMessage}
        />
        <MessagesComponent
          messages={this.state.messages}
          toggleStar={this.toggleStar}
          toggleSelect={this.toggleSelect}
        />
      </div>
    );
  }
}

export default App;
