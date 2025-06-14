/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-await-in-loop */
import React, {
    useRef, useEffect, useState, useCallback
} from 'react'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import useRenderFps from '@/hooks/useRenderFps'
import { VAR, rem, remReverse } from '@/style/index'
import { UI_CMD_TYPE, TASK_TOPIC_TYPE } from '@/utils/constants'
import useSubTask from '@/hooks/useSubTask'
import {
    unitConversion, getProcessID, underlineToHump
} from '@/utils/utils'
import { GridLayoutContainer, SignalsContainer } from './style'
import { LAYOUT_TYPE } from '../../constant'

const GridLayout = ({ initVal, onCallback, domId }) => {
    const {
        backgroundColor, colNum, rowNum, data,
        showLayout, fontSizeColor, fontSize, variableCode, gridLineColor
    } = initVal
    const [tempData, setTempData] = useState()
    const { useSubscriber } = useSubTask()
    const subTaskReplaceData = useSelector(state => state.subTask.subTaskReplaceData)
    const unitList = useSelector(state => state.global.unitList)
    const signalList = useSelector(state => state.template.signalList)
    const [clientData, setClientData] = useState([])
    const [replaceData, setReplaceData] = useState({})
    const clientSub = useRef()

    const dataCallback = useCallback((newData) => {
        if (Array.isArray(newData)) {
            setClientData(newData[newData.length - 1])
        }
    }, [])

    const { addDataToBuffer } = useRenderFps(dataCallback)

    useEffect(() => {
        initUseSubscriber(variableCode)
        return () => {
            clientSub.current?.close?.()
            setReplaceData({})
            setClientData([])
        }
    }, [getProcessID(),
        variableCode])

    const initUseSubscriber = async (bufferCode) => {
        clientSub.current = await useSubscriber(`${getProcessID()}-${bufferCode}-UIData`)
        for await (const [_topic, msg] of clientSub.current) {
            const var_values = JSON.parse(msg)?.UIParams?.VarValues
            addDataToBuffer(var_values)
        }
    }

    // 原始信号变量
    useEffect(() => {
        // if (subTaskHeaderData?.UICmd === UI_CMD_TYPE.SIGNAL_VAR) {
        //     const var_values = subTaskHeaderData?.UIParams?.VarValues
        //     setClientData(var_values)
        // }
        if (subTaskReplaceData.UICmd === UI_CMD_TYPE.REPLACE_DATA) {
            setReplaceData(subTaskReplaceData?.UIParams)
        }
    }, [subTaskReplaceData])

    const getSignals = (i, c) => {
        const val = underlineToHump(i)
        return {
            id: val?.signalVariableId,
            key: val?.signalVariableId,
            label: val?.variableName,
            unitId: c?.unitId,
            decimal: 3,
            isIcon: false,
            img: '',
            value: 0,
            dimensionId: c?.dimensionId,
            code: val?.code
        }
    }

    useEffect(() => {
        const temp = data?.map(c => {
            return {
                ...c,
                signals: c?.signals?.map(signalId => {
                    const signal = signalList?.find(f => f?.signal_variable_id === signalId)
                    return getSignals(signal, c)
                }) || []
            }
        })
        setTempData(temp)
        calculateData(temp)
    }, [initVal, getProcessID(), signalList])

    useEffect(() => {
        if (tempData) {
            calculateData(tempData)
        }
    }, [colNum, rowNum])

    const handleLoad = useCallback(
        debounce((i) => handleMouseOver(i), 300),
        []
    )

    const handleMouseOver = (e) => {
        onCallback(e)
    }

    const calculateData = (val) => {
        const gridCount = (rowNum * colNum)
        if (val?.length < (rowNum * colNum)) {
            setTempData(val.concat(Array.from({ length: gridCount - val.length }).map(i => ({ key: crypto.randomUUID() }))))
        }
    }

    const justifyContent = {
        [LAYOUT_TYPE.CENTER]: 'center',
        [LAYOUT_TYPE.BETWEEN]: 'space-between',
        [LAYOUT_TYPE.ROW]: 'flex-start',
        [LAYOUT_TYPE.ROWS]: 'flex-start'
    }

    const contentStyle = () => {
        const color = {
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
            paddingRight: '10px'
            // justifyContent: justifyContent[showLayout]
            // height: `${parseFloat(VAR.layoutHeader) / num}vh`
        }
        return color
    }

    const gridStyle = () => {
        let num = rowNum
        if (tempData?.length > (rowNum * colNum)) {
            num += Math.floor(tempData?.length / (rowNum * colNum))
        }
        return {
            gridTemplateColumns: `repeat(${colNum}, 1fr)`,
            gridTemplateRows: `repeat(${num}, 1fr)`
        }
    }
    const contentBorder = (index) => {
        let content = 'content layout-content'
        const num = ((rowNum * colNum) - colNum)
        if (index >= num && (num + index - num + 1)) {
            content += ' content-border-button'
        }
        if ((index + 1) % colNum === 0) {
            content += ' content-border'
        }
        return content
    }

    const getValue = (i) => {
        let value = i?.value
        const { currentCode = '', replaceCode = '' } = replaceData
        const isExist = tempData?.some(s => s?.code === currentCode)
        const accessData = clientData?.find(f => {
            if (currentCode && isExist && i.code === currentCode) {
                return replaceCode === f?.Code
            }
            return i?.code === f?.Code
        })
        if (accessData?.Value || accessData?.Value === 0) {
            value = accessData?.Value
        }
        return unitConversion(value, i.dimensionId, i.unitId)?.toFixed(i?.decimal)
    }

    const Signals = ({ signals }) => {
        return (
            <SignalsContainer>
                {signals?.map(i => {
                    return (
                        <div
                            className="signal-content"
                            key={i.key}
                            onContextMenuCapture={() => {
                                onCallback(i)
                            }}
                        >
                            <div>
                                {i?.label}
                                {i?.label && '：'}
                            </div>
                            <div className={[showLayout === LAYOUT_TYPE.ROWS ? '' : 'rows']}>
                                <div>{('value' in i) && getValue(i)}</div>
                                <div>{unitList?.find(f => f.id === i?.dimensionId)?.units.find(f => f?.id === i?.unitId)?.name}</div>
                            </div>
                        </div>
                    )
                })}
            </SignalsContainer>
        )
    }
    const Layout = ({ i }) => {
        return (
            <div
                key={i.key}
                style={contentStyle()}
                onContextMenuCapture={() => {
                    onCallback(i)
                }}
            >
                <div className="title">
                    {i?.isIcon && <img src={i?.img} className="img" alt="" />}
                    {i?.label}
                    {i?.label && ' ：'}
                </div>
                <div className={[showLayout === LAYOUT_TYPE.ROWS ? '' : 'rows']}>
                    <div>{('value' in i) && getValue(i)}</div>
                    <div>{unitList?.find(f => f.id === i?.dimensionId)?.units.find(f => f?.id === i?.unitId)?.name}</div>
                </div>
            </div>
        )
    }
    return (
        <GridLayoutContainer>
            <div
                id="content"
                className="grid"
                style={gridStyle()}
            >
                {tempData?.map((i, index) => (
                    <div
                        key={i.key}
                        style={{
                            backgroundColor,
                            color: fontSizeColor,
                            fontSize,
                            justifyContent: justifyContent[showLayout],
                            borderColor: gridLineColor
                        }}
                        className={contentBorder(index)}
                        // 右键事件
                        onContextMenuCapture={() => {
                            onCallback(i)
                        }}
                    >
                        <Layout i={i} />
                        {i?.signals && i?.signals.length > 0
                            && <Signals signals={i?.signals} />}

                    </div>
                ))}
            </div>
        </GridLayoutContainer>

    )
}

export default GridLayout
