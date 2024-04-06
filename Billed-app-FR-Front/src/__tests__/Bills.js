/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

import {formatDate} from "../app/format.js";

import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Check if the bill icon is highlighted
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // to-do write expect expression
      expect(windowIcon.classList).toContain('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // test for new bill button
  describe("When I click on New Bill button", () => {
    test("Then it should navigate and display the new bill form", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // check if the new bill button is displayed
      const newBillButton = screen.getByTestId('btn-new-bill')
      expect(newBillButton).toBeTruthy()
      userEvent.click(newBillButton)
      // check if the window location is new bill page
      await waitFor(() => expect(window.location.href).toBe('http://localhost/#employee/bill/new'))
      // check if the new bill form is displayed
      const newBillForm = await screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })

  //test for eye icon
  describe("When I click on the eye icon", () => {
    test("Then a modal should open", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Initialize the bills container
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })
      document.body.innerHTML = BillsUI({data: bills})

      // check if the eye icon is displayed
      const eyeIcons = screen.getAllByTestId('icon-eye')
      expect(eyeIcons).toBeTruthy()

      // check if the handleClickIconEye function (containers\Bills line23) is called
      const mockedHandleClickIconEye = jest.fn(eyeIcon => billsContainer.handleClickIconEye(eyeIcon))

      // replace the jquery modal function with a mock function
      $.fn.modal = jest.fn()

      // loop through the eye icons and click on each
      eyeIcons.forEach(eyeIcon => {
        eyeIcon.addEventListener('click', () => mockedHandleClickIconEye(eyeIcon))
        userEvent.click(eyeIcon)

        // check if the mockedHandleClickIconEye function is called
        expect(mockedHandleClickIconEye).toHaveBeenCalled()

        // check if the modal is opened
        expect(screen.getByText('Justificatif')).toBeTruthy()
      })

      // check if html element whose id is "modaleFile" has a attribute display set to block
        const modal = screen.getByTestId('modaleFile')
        expect(modal).toBeTruthy()
    })
  })
})

// integration test GET
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("then fetches bills from fixtures", async () => {
      document.body.innerHTML = BillsUI({data: bills})
      expect(bills.length).toBeGreaterThan(0)
    })

    test("then the bills should be displayed", async () => {
      // check if the table exists
      const table = screen.getByTestId("tbody")
      expect(table).toBeTruthy()
    })

    test("then bills should have a correct date", async () => {
      // regex for date format "4 Avr. 04"
      const expectedDateRegex = /^\d{1,2}\s(?:Jan\.|F[eé]v\.|Mar\.|Avr\.|Mai|Jui\.|Juil\.|Ao[uû]t|Sep\.|Oct\.|Nov\.|D[eé]c\.)\s\d{2}$/;
      // loop through the bills and check if the date is correct
      bills.forEach(bill => {
        const formattedDate = formatDate(bill.date)
        // check if there is a date
          expect(formattedDate).toBeTruthy()
          // check if the date is in the correct format
          expect(formattedDate).toMatch(expectedDateRegex)
      })
    })

    test("then bills should have a correct status", async () => {
      // regex for status format "pending|accepted|refused"
      const expectedStatus = /^(pending|accepted|refused)$/;
      // loop through the bills and check if the status is correct
      bills.forEach(bill => {
        const status = bill.status
        // check if there is a status
        expect(status).toBeTruthy()
        // check if the status is in the correct format
        expect(status).toMatch(expectedStatus)
      })
    })
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // initialize mockSTore
      jest.spyOn(mockStore, "bills").mockReturnValue({
        list: () => Promise.resolve([])
      });

      Object.defineProperty(
          window,
          'localStorage',
          {value: localStorageMock}
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur/)
      expect(message).toBeTruthy()
    })
    test("then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur/)
      expect(message).toBeTruthy()
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})


