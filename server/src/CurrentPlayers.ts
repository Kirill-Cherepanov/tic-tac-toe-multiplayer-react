const dbData: DbData = {
  players: {
    fake_id1: {
      username: 'My Angel Kanna',
      invited: ['fake_id1'],
      wasInvited: [],
      searchParams: {
        matchTime: { value: 5, strict: true },
        breakTime: { value: 10, strict: false }
      }
    },
    fake_id2: {
      username: 'Shiraori',
      invited: [],
      wasInvited: ['fake_id1'],
      searchParams: {
        matchTime: { value: 20, strict: false },
        breakTime: { value: 0, strict: false }
      }
    }
  },
  games: {
    fake_room: {
      inviter: {
        id: 'fake_id3',
        username: 'KissMy'
      },
      invitee: {
        id: 'fake_id4',
        username: 'Kot-payk'
      },
      currentBoard: ['', '', '', '', '', '', '', '', ''],
      currentMove: 'Kot-payk',
      matchTime: 10,
      breakTime: 5
    }
  }
};

export default dbData;
