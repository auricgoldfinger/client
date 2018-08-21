// @flow
import * as React from 'react'
import * as Container from '../../../../../util/container'
import * as ChatTypes from '../../../../../constants/types/chat2'
import * as WalletConstants from '../../../../../constants/wallets'
import * as WalletTypes from '../../../../../constants/types/wallets'
import {formatTimeForMessages} from '../../../../../util/timestamp'
import PaymentPopup from '.'
import type {Position} from '../../../../../common-adapters/relative-popup-hoc'

// This file has two connectors and a wrapper. One connector is for sendPayment
// and the other for requestPayment. The wrapper decides which to use.

type OwnProps = {|
  attachTo: ?React.Component<any, any>,
  message: ChatTypes.MessageRequestPayment | ChatTypes.MessageSendPayment,
  onHidden: () => void,
  position: Position,
  visible: boolean,
|}

const commonLoadingProps = {
  amountNominal: '',
  balanceChange: '',
  balanceChangeColor: '',
  bottomLine: '',
  icon: 'sending',
  loading: true,
  onCancel: null,
  sender: '',
  senderDeviceName: '',
  timestamp: '',
  topLine: '',
  txVerb: 'sent',
}

// MessageSendPayment ===================================
const sendMapStateToProps = (state: Container.TypedState, ownProps: OwnProps) => {
  return {}
}

const sendMergeProps = (stateProps, _, ownProps: OwnProps) => {
  return {
    ...commonLoadingProps,
    attachTo: ownProps.attachTo,
    onHidden: ownProps.onHidden,
    position: ownProps.position,
    visible: ownProps.visible,
  }
}

const SendPaymentPopup = Container.connect(sendMapStateToProps, () => ({}), sendMergeProps)(PaymentPopup)

// MessageRequestPayment ================================
const requestMapStateToProps = (state: Container.TypedState, ownProps: OwnProps) => {
  if (ownProps.message.type !== 'requestPayment') {
    throw new Error(`RequestPaymentPopup: impossible case encountered: ${ownProps.message.type}`)
  }
  const {requestID} = ownProps.message
  const _request = WalletConstants.getRequest(state, requestID)
  return {
    _request,
    _you: state.config.username,
  }
}

const requestMapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
  onCancel: () => {
    // TODO
  },
})

const requestMergeProps = (stateProps, dispatchProps, ownProps: OwnProps) => {
  const request = stateProps._request
  if (!request) {
    return {
      ...commonLoadingProps,
      attachTo: ownProps.attachTo,
      onHidden: ownProps.onHidden,
      position: ownProps.position,
      visible: ownProps.visible,
    }
  }
  const you = stateProps._you

  let bottomLine = ''
  if (request.asset !== 'native' && request.asset !== 'currency') {
    bottomLine = request.asset.issuerName || request.asset.issuerAccountID || ''
  }

  let topLine = `${ownProps.message.author === you ? 'you requested' : 'requested'}${
    request.asset === 'currency' ? ' lumens worth' : ''
  }`

  return {
    amountNominal: request.amountDescription,
    attachTo: ownProps.attachTo,
    balanceChange: '',
    balanceChangeColor: '',
    bottomLine,
    icon: 'receiving',
    loading: false,
    onCancel: ownProps.message.author === you ? dispatchProps.onCancel : null,
    onHidden: ownProps.onHidden,
    position: ownProps.position,
    sender: ownProps.message.author,
    senderDeviceName: ownProps.message.deviceName,
    timestamp: formatTimeForMessages(ownProps.message.timestamp),
    topLine,
    txVerb: 'requested',
    visible: ownProps.visible,
  }
}

const RequestPaymentPopup = Container.connect(
  requestMapStateToProps,
  requestMapDispatchToProps,
  requestMergeProps
)(PaymentPopup)

// Wrapper ==============================================
const PaymentPopupChooser = (props: OwnProps) => {
  switch (props.message.type) {
    case 'sendPayment':
      // $FlowIssue complains about different props but all use OwnProps
      return <SendPaymentPopup {...props} />
    case 'requestPayment':
      // $FlowIssue complains about different props but all use OwnProps
      return <RequestPaymentPopup {...props} />
    default:
      throw new Error(`PaymentPopup: impossible case encountered: ${props.message.type}`)
  }
}

export default PaymentPopupChooser
