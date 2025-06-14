import styled from 'styled-components'
import { VAR, rem } from '@/style/index'

export const GridLayoutContainer = styled.div`  
    height: 100%;
    width: 100%;
    .grid {
        display: grid;
        /* grid-auto-rows: 100px; */
        /* height: ${VAR.layoutHeader}; */
        height: 100%;
        .layout-content {
            display: flex;
            justify-content: space-between;
        }
    }

    .content {
        /* max-height: ${rem('100px')}; */
        border-right: 1px solid #0643ED;
        border-bottom: 1px solid #0643ED;
        .title {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: right;
            .img {
                height: ${rem('40px')};
                width: ${rem('40px')};
                margin-right: 10px;
            }
        }
      .rows {
        display: flex;
      }  
    }
    

    .content-border {
         border-right: none;
    }
    .content-border-button{
         border-bottom: none;
    }

`
export const SignalsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .signal-content {
        display: flex;
        justify-content: flex-end;
    }

`
